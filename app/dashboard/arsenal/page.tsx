'use client';

import React, { useState, useEffect, FormEvent } from 'react';

// Firebase Import

import { 
  collection, 
  query, 
  where, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

import { firestoreDB } from '@/firebase/init-firebase';
import { EventData, ArsenalData } from "@/firebase/collection-types";
import { Timestamp, DocumentReference } from "firebase/firestore";

// Component Imports
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


import { 
  Plus, 
  Trash2,
  Edit,
  X,
  Save
} from 'lucide-react';

interface ArsenalItem {
  id: string;
  name: string;
  type: string;
  events: DocumentReference[];
  dateAdded: Date;
}

export const EquipmentTable: React.FC<{ 
  equipment: ArsenalItem[], 
  onDelete: (id: string, type: string) => void, 
  onEdit: (id: string, newName: string) => void 
}> = ({ equipment, onDelete, onEdit }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleEditClick = (item: ArsenalItem) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
  };

  const handleCancelClick = () => {
    setIsCancelDialogOpen(false);
    setEditingItemId(null);
    setEditedName("");
  };

  const confirmCancel = () => {
    setIsCancelDialogOpen(true);
  };

  const handleSaveClick = () => {
    setIsSaveDialogOpen(false);
    if (editingItemId && editedName) {
      onEdit(editingItemId, editedName);
      setEditingItemId(null);
      setEditedName("");
    }
  };

  const confirmSave = () => {
    setIsSaveDialogOpen(true);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/12">ID</TableHead>
          <TableHead className="w-1/2">Equipment</TableHead>
          <TableHead>Event</TableHead>
          <TableHead className="w-[50px] text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {equipment.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="w-1/12">{item.id}</TableCell>
            <TableCell className="w-1/2">
              {editingItemId === item.id ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              ) : (
                item.name
              )}
            </TableCell>
            <TableCell>{item.events.length > 0 ? item.events.join(", ") : "-"}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {editingItemId === item.id ? (
                  <>
                    <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-2"
                          onClick={confirmSave}
                        >
                          <Save className="w-5 h-5 text-white"/>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Rename</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p>Are you sure you want to rename to "{editedName}"?</p>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSaveClick}>
                            Save
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-2"
                          onClick={confirmCancel}
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Cancel</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p>Are you sure you want to discard changes?</p>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelClick}>
                            Discard
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <button
                      className="p-2"
                      onClick={() => handleEditClick(item)}
                    >
                      <Edit className="w-5 h-5 text-white"/>
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2">
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p>Are you sure you want to delete "{item.name}"?</p>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(item.id, item.type)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};



const ArsenalPage: React.FC = () => {
  const [cameraEquipment, setCameraEquipment] = useState<ArsenalItem[]>([]);
  const [laptopEquipment, setLaptopEquipment] = useState<ArsenalItem[]>([]);
  const [printerEquipment, setPrinterEquipment] = useState<ArsenalItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('camera');  // Track selected tab

  const fetchEquipments = async (
    type: string,
    setState: React.Dispatch<React.SetStateAction<ArsenalItem[]>>
  ) => {
    try {
      const q = query(collection(firestoreDB, "arsenal"), where("type", "==", type));
      const querySnapshot = await getDocs(q);
  
      // Process each document
      const equipment = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
  
          // If the events field exists and is an array of references
          if (data.events && Array.isArray(data.events)) {
            const eventStrings = await Promise.all(
              data.events.map(async (eventRef: DocumentReference) => {
                try {
                  console.log("Event Reference Type:", eventRef.path);
                  console.log("Is DocumentReference:", eventRef instanceof DocumentReference);
                  const eventDoc = await getDoc(eventRef);
                  console.log("eventDoc:", eventDoc)
                  if (eventDoc.exists()) {
                    const eventData = eventDoc.data() as EventData;
                    
                    return eventData.eventName || "Unknown Event";
                  } else {
                    return "Unknown Event (Reference not found)";
                  }
                } catch (error) {
                  console.error("Error fetching event data:", error);
                  return "Error loading event";
                }
              })
            );
            data.events = eventStrings; // Replace references with strings
          }
  
          return { id: docSnapshot.id, ...data } as ArsenalItem;
        })
      );
  
      setState(equipment);
    } catch (error) {
      console.error(`Error fetching ${type} equipment:`, error);
    }
  };
  

  useEffect(() => {
    fetchEquipments("camera", setCameraEquipment);
    fetchEquipments("laptop", setLaptopEquipment);
    fetchEquipments("printer", setPrinterEquipment);
  }, []);

  const handleAddArsenal = async (name: string, type: string) => {
    try {
      const docRef = await addDoc(collection(firestoreDB, "arsenal"), {
        name: name,
        type: type,
        events: [],
        dateAdded: serverTimestamp(),
      });
      console.log("Document written with ID: ", docRef.id);

      // Refresh the equipment list after adding
      fetchEquipments(type, type === "camera" 
        ? setCameraEquipment 
        : type === "laptop" 
        ? setLaptopEquipment 
        : setPrinterEquipment
      );
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleEditArsenal = async (id: string, newName: string) => {
    try {
      const docRef = doc(firestoreDB, "arsenal", id);
      await updateDoc(docRef, { name: newName });
      console.log("Document updated with ID: ", id);

      var type = selectedTab

      // Refresh the equipment list after updating
      fetchEquipments(
        type,
        type === "camera"
          ? setCameraEquipment
          : type === "laptop"
          ? setLaptopEquipment
          : setPrinterEquipment
      );
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const handleDeleteArsenal = async (id: string, type: string) => {
    try {
      await deleteDoc(doc(firestoreDB, "arsenal", id));
      console.log("Document deleted with ID: ", id);

      // Refresh the equipment list after deleting
      fetchEquipments(type, 
        type === "camera" 
        ? setCameraEquipment 
        : type === "laptop" 
        ? setLaptopEquipment 
        : setPrinterEquipment
      );
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  return (
    <div className="mim-full flex p-4 flex-1 flex-col">
      <h1 className="text-3xl font-semibold mb-4 ml-4">Arsenal</h1>

      <Card className="w-full h-full flex flex-col">
        <CardContent className="flex-1 flex flex-col flex-1 p-6 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="grid w-full">
            <div className='flex'>
              <TabsList className="flex-1 grid grid-cols-3">
                <TabsTrigger value="camera">Camera</TabsTrigger>
                <TabsTrigger value="laptop">Laptop</TabsTrigger>
                <TabsTrigger value="printer">Printer</TabsTrigger>
              </TabsList>
              <AlertDialog>
                <AlertDialogTrigger className="flex items-center p-2 bg-blue-500 text-white rounded-md ml-6">
                  <Plus className="w-5 h-5" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Add Arsenal</AlertDialogTitle>
                  </AlertDialogHeader>
                  <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const arsenalType = formData.get("arsenalType") as string;
                      const arsenalName = formData.get("arsenalName") as string;
                      handleAddArsenal(arsenalName, arsenalType);
                    }}
                  >
                    <Label htmlFor="arsenalName" className="block mb-4">Name</Label>
                    <input
                      type="text"
                      name="arsenalName"
                      id="arsenalName"
                      className="w-full p-2 border rounded-md mb-4"
                      placeholder="Enter arsenal name"
                      required
                    />
                    <Label className="block mb-4">Type</Label>
                    <RadioGroup name="arsenalType" defaultValue={selectedTab} className="mb-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="camera" id="camera" />
                        <Label htmlFor="camera">Camera</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="laptop" id="laptop" />
                        <Label htmlFor="laptop">Laptop</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="printer" id="printer" />
                        <Label htmlFor="printer">Printer</Label>
                      </div>
                    </RadioGroup>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction type="submit">Add</AlertDialogAction>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <TabsContent value="camera">
              <EquipmentTable equipment={cameraEquipment} onDelete={handleDeleteArsenal} onEdit={handleEditArsenal} />
            </TabsContent>
            <TabsContent value="laptop">
             <EquipmentTable equipment={laptopEquipment} onDelete={handleDeleteArsenal} onEdit={handleEditArsenal} />
            </TabsContent>
            <TabsContent value="printer">
              <EquipmentTable equipment={printerEquipment} onDelete={handleDeleteArsenal} onEdit={handleEditArsenal} />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex-none flex justify-end pt-4">
          
        </CardFooter>
      </Card>
    </div>
  );
};

export default ArsenalPage;
