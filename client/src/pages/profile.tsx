import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DocumentViewer from "@/components/document-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Heart, PawPrint, UserCircle2, FileText, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  city?: string;
  housingType?: string;
  petExperience?: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [ownerApplications, setOwnerApplications] = useState<any[]>([]);
  const [editingPet, setEditingPet] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editDocuments, setEditDocuments] = useState<File | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`/api/pets?userId=${user.id}`, { credentials: "include" })
        .then(res => res.json())
        .then(setPets);
      fetch(`/api/applications?userId=${user.id}`, { credentials: "include" })
        .then(res => res.json())
        .then(setApplications);
      fetch("/api/owner/applications", { credentials: "include" })
        .then(res => res.json())
        .then(setOwnerApplications);
    }
  }, [user]);

  const refreshPets = () => {
    if (user) {
      fetch(`/api/pets?userId=${user.id}`, { credentials: "include" })
        .then(res => res.json())
        .then(setPets);
    }
  };

  const handleDeletePet = async (petId: number) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;
    const res = await fetch(`/api/pets/${petId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast({ title: "Pet deleted" });
      refreshPets();
    } else {
      toast({ title: "Failed to delete pet", variant: "destructive" });
    }
  };

  const openEditModal = (pet: any) => {
    setEditingPet(pet);
    setEditForm({
      name: pet.name || "",
      type: pet.type || "",
      breed: pet.breed || "",
      age: pet.age || "",
      gender: pet.gender || "male",
      description: pet.description || "",
      location: pet.location || "",
      imageUrl: pet.imageUrl || "",
      documentsUrl: pet.documentsUrl || "",
      status: pet.status || "available",
    });
    setEditImage(null);
    setEditDocuments(null);
    setIsEditOpen(true);
  };

  const handleEditInput = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditImage = (file: File | null) => {
    setEditImage(file);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet) return;
    const data = new FormData();
    data.append("name", editForm.name);
    data.append("type", editForm.type);
    data.append("breed", editForm.breed);
    data.append("age", editForm.age);
    data.append("gender", editForm.gender);
    data.append("description", editForm.description);
    data.append("location", editForm.location);
    data.append("status", editForm.status);
    if (!editImage && editForm.imageUrl) {
      data.append("imageUrl", editForm.imageUrl);
    }
    if (editImage) {
      data.append("image", editImage);
    }
    if (editForm.documentsUrl) {
      data.append("documentsUrl", editForm.documentsUrl);
    }
    if (editDocuments) {
      data.append("documents", editDocuments);
    }
    const res = await fetch(`/api/pets/${editingPet.id}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    });
    if (res.ok) {
      toast({ title: "Pet updated" });
      setIsEditOpen(false);
      setEditingPet(null);
      refreshPets();
    } else {
      toast({ title: "Failed to update pet", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  if (isLoggingOut) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
      <Header />
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <Card className="mb-10 shadow-xl border-0 bg-white/90">
            <CardHeader className="flex flex-row items-center gap-6 p-8">
              <Avatar className="h-20 w-20 text-4xl bg-gradient-to-br from-coral to-peach text-white">
                <UserCircle2 className="h-16 w-16 mx-auto my-auto" />
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold mb-1 flex items-center gap-2">
                  {user?.fullName}
                  <Badge className="bg-coral text-white ml-2">{user?.username}</Badge>
                </CardTitle>
                <div className="text-gray-600 mb-1">{user?.email}</div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {user?.phone && <span>📞 {user.phone}</span>}
                  {user?.city && <span>🏙️ {user.city}</span>}
                  {user?.housingType && <span>🏠 {user.housingType}</span>}
                </div>
                {user?.petExperience && (
                  <div className="mt-2 text-sm text-gray-700 italic">Pet Experience: {user.petExperience}</div>
                )}
              </div>
              <Button variant="outline" className="ml-4" onClick={handleLogout}>Logout</Button>
            </CardHeader>
          </Card>

          {/* Submitted Pets */}
          <Card className="mb-10 shadow-lg border-0 bg-peach/10">
            <CardHeader className="flex flex-row items-center gap-3 p-6">
              <PawPrint className="h-7 w-7 text-coral" />
              <CardTitle className="text-xl font-semibold">Your Submitted Pets</CardTitle>
            </CardHeader>
            <CardContent>
              {pets.length === 0 ? (
                <div className="text-gray-500">No pets submitted yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map(pet => (
                    <Card key={pet.id} className="p-4 flex flex-col gap-2 border-coral/20">
                      <div className="flex items-center gap-2">
                        <Heart className="text-coral h-5 w-5" />
                        <span className="font-bold text-lg">{pet.name}</span>
                        <Badge className="ml-2 bg-mint text-white capitalize">{pet.type}</Badge>
                      </div>
                      <div className="text-gray-600 text-sm">Breed: {pet.breed}</div>
                      <div className="text-gray-500 text-xs">Status: <span className={
                        pet.status === 'available' ? 'text-green-600' : pet.status === 'pending' ? 'text-yellow-600' : 'text-gray-400'
                      }>{pet.status}</span></div>
                      {pet.imageUrl && (
                        <img src={pet.imageUrl} alt={pet.name} className="w-full h-40 object-cover rounded-lg mt-2" />
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(pet)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePet(pet.id)}>
                          Delete
                        </Button>
                      </div>
                      {pet.documentsUrl && (
                        <div className="mt-2">
                          <DocumentViewer 
                            documentUrl={pet.documentsUrl} 
                            documentName={`${pet.name}'s Documents`}
                          >
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View Documents
                            </Button>
                          </DocumentViewer>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Pet Modal */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl h-[80vh]">
              <DialogHeader>
                <DialogTitle>Edit Pet Details</DialogTitle>
              </DialogHeader>
              {editForm && (
                <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto h-full p-2">
                  <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <Input value={editForm.name || ""} onChange={e => handleEditInput("name", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Type</label>
                    <Input value={editForm.type || ""} onChange={e => handleEditInput("type", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Breed</label>
                    <Input value={editForm.breed || ""} onChange={e => handleEditInput("breed", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Age</label>
                    <Input value={editForm.age || ""} onChange={e => handleEditInput("age", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <Textarea value={editForm.description || ""} onChange={e => handleEditInput("description", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Location</label>
                    <Input value={editForm.location || ""} onChange={e => handleEditInput("location", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Image</label>
                    <Input type="file" accept="image/*" onChange={e => handleEditImage(e.target.files?.[0] || null)} />
                    {editForm.imageUrl && !editImage && (
                      <img src={editForm.imageUrl} alt="Current" className="w-full h-32 object-cover rounded mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Documents</label>
                    <Input type="file" accept="application/pdf,image/*" onChange={e => setEditDocuments(e.target.files?.[0] || null)} />
                    {editForm.documentsUrl && (
                      <div className="mt-2">
                        <DocumentViewer 
                          documentUrl={editForm.documentsUrl} 
                          documentName="Current Documents"
                        >
                          <Button 
                            size="sm" 
                            variant="outline" 
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Current Documents
                          </Button>
                        </DocumentViewer>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Gender</label>
                    <Select value={editForm.gender || ""} onValueChange={value => handleEditInput("gender", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Status</label>
                    <Select value={editForm.status || "available"} onValueChange={value => handleEditInput("status", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="adopted">Adopted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Adoption Applications for Your Pets */}
          <Card className="mb-10 shadow-lg border-0 bg-coral/10">
            <CardHeader className="flex flex-row items-center gap-3 p-6">
              <PawPrint className="h-7 w-7 text-coral" />
              <CardTitle className="text-xl font-semibold">Adoption Applications for Your Pets</CardTitle>
            </CardHeader>
            <CardContent>
              {ownerApplications.length === 0 ? (
                <div className="text-gray-500">No adoption applications for your pets yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownerApplications.map(app => (
                    <Card key={app.id} className="p-4 flex flex-col gap-2 border-coral/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">Pet: {app.pet?.name || `ID ${app.petId}`}</span>
                        <Badge className={
                          app.status === 'approved' ? 'bg-green-500 text-white' :
                          app.status === 'pending' ? 'bg-yellow-400 text-gray-800' :
                          'bg-gray-300 text-gray-700'
                        }>{app.status}</Badge>
                      </div>
                      <div className="text-gray-600 text-sm mb-2">Application ID: {app.id}</div>
                      <div className="text-gray-700 text-sm mb-2">Adopter Details:</div>
                      {app.adopter ? (
                        <div className="ml-2 text-sm text-gray-800 space-y-1">
                          <div><span className="font-semibold">Name:</span> {app.adopter.fullName}</div>
                          <div><span className="font-semibold">Email:</span> {app.adopter.email}</div>
                          {app.adopter.phone && <div><span className="font-semibold">Phone:</span> {app.adopter.phone}</div>}
                          {app.adopter.city && <div><span className="font-semibold">City:</span> {app.adopter.city}</div>}
                          {app.adopter.housingType && <div><span className="font-semibold">Housing:</span> {app.adopter.housingType}</div>}
                          {app.adopter.petExperience && <div><span className="font-semibold">Experience:</span> {app.adopter.petExperience}</div>}
                        </div>
                      ) : (
                        <div className="ml-2 text-sm text-gray-500">Adopter details not available.</div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
} 