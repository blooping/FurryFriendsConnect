import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Heart, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Database, 
  Clock,
  Bot,
  Users
} from "lucide-react";
import { useState } from "react";
import { Pet, AdoptionApplication, InsertPet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { capitalizeFirst, formatAge, formatLocation } from "@/lib/utils";

interface AdminStats {
  totalPets: number;
  adoptionsToday: number;
  pendingApplications: number;
  aiMatches: number;
}

export default function Admin() {
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [newPet, setNewPet] = useState<Partial<InsertPet>>({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    description: "",
    location: "",
    imageUrl: "",
    status: "available",
    personality: {},
    careNeeds: {},
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch pets
  const { data: pets, isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  // Fetch applications
  const { data: applications } = useQuery<AdoptionApplication[]>({
    queryKey: ["/api/applications"],
  });

  // Create pet mutation
  const createPetMutation = useMutation({
    mutationFn: async (petData: InsertPet) => {
      return await apiRequest("POST", "/api/pets", petData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsAddPetOpen(false);
      resetForm();
      toast({
        title: "Pet Added",
        description: "New pet has been successfully added to the database.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add pet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update pet mutation
  const updatePetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPet> }) => {
      return await apiRequest("PUT", `/api/pets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditingPet(null);
      resetForm();
      toast({
        title: "Pet Updated",
        description: "Pet information has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete pet mutation
  const deletePetMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/pets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Pet Deleted",
        description: "Pet has been successfully removed from the database.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete pet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PUT", `/api/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Application Updated",
        description: "Application status has been updated.",
      });
    },
  });

  const resetForm = () => {
    setNewPet({
      name: "",
      type: "",
      breed: "",
      age: "",
      gender: "",
      description: "",
      location: "",
      imageUrl: "",
      status: "available",
      personality: {},
      careNeeds: {},
    });
  };

  const handleInputChange = (field: keyof InsertPet, value: any) => {
    setNewPet(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPet) {
      updatePetMutation.mutate({ 
        id: editingPet.id, 
        data: newPet as InsertPet 
      });
    } else {
      createPetMutation.mutate(newPet as InsertPet);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setNewPet({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      description: pet.description,
      location: pet.location,
      imageUrl: pet.imageUrl,
      status: pet.status,
      personality: pet.personality,
      careNeeds: pet.careNeeds,
    });
    setIsAddPetOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this pet?")) {
      deletePetMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
      <Header />
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">Manage pet listings and adoption applications</p>
          </div>

          {/* Dashboard Header */}
          <Card className="shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-2xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    FurryFriends Admin
                  </h2>
                  <p className="text-gray-300">PostgreSQL Database Management</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                  <span className="text-sm">Database Connected</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-coral/10 to-peach/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Pets</p>
                    <p className="font-bold text-2xl text-gray-800">
                      {stats?.totalPets || 0}
                    </p>
                  </div>
                  <Heart className="text-coral h-8 w-8" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-mint/10 to-powder/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Adoptions Today</p>
                    <p className="font-bold text-2xl text-gray-800">
                      {stats?.adoptionsToday || 0}
                    </p>
                  </div>
                  <Users className="text-mint h-8 w-8" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-butter/10 to-coral/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Applications</p>
                    <p className="font-bold text-2xl text-gray-800">
                      {stats?.pendingApplications || 0}
                    </p>
                  </div>
                  <Clock className="text-butter h-8 w-8" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-lavender/10 to-mint/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">AI Matches</p>
                    <p className="font-bold text-2xl text-gray-800">
                      {stats?.aiMatches || 0}
                    </p>
                  </div>
                  <Bot className="text-lavender h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pet Management */}
          <Card className="shadow-xl mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-coral" />
                  Pet Listings Management
                </CardTitle>
                <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="gradient-coral-peach text-white hover:shadow-lg transition-all duration-300"
                      onClick={() => {
                        setEditingPet(null);
                        resetForm();
                      }}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add New Pet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPet ? "Edit Pet" : "Add New Pet"}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={newPet.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Type *</Label>
                          <Select value={newPet.type} onValueChange={(value) => handleInputChange("type", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dog">Dog</SelectItem>
                              <SelectItem value="cat">Cat</SelectItem>
                              <SelectItem value="rabbit">Rabbit</SelectItem>
                              <SelectItem value="bird">Bird</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="breed">Breed *</Label>
                          <Input
                            id="breed"
                            value={newPet.breed}
                            onChange={(e) => handleInputChange("breed", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="age">Age *</Label>
                          <Input
                            id="age"
                            value={newPet.age}
                            onChange={(e) => handleInputChange("age", e.target.value)}
                            placeholder="e.g., 2 years"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gender">Gender *</Label>
                          <Select value={newPet.gender} onValueChange={(value) => handleInputChange("gender", value)}>
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
                          <Label htmlFor="status">Status</Label>
                          <Select value={newPet.status} onValueChange={(value) => handleInputChange("status", value)}>
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
                      </div>

                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={newPet.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder="e.g., San Francisco, CA"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={newPet.imageUrl}
                          onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                          placeholder="https://example.com/pet-image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={newPet.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Describe the pet's personality and characteristics..."
                          required
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddPetOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="gradient-coral-peach text-white"
                          disabled={createPetMutation.isPending || updatePetMutation.isPending}
                        >
                          {editingPet ? "Update Pet" : "Add Pet"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {petsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-coral border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading pets...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pets?.map((pet) => (
                        <TableRow key={pet.id}>
                          <TableCell className="text-gray-600">#{pet.id}</TableCell>
                          <TableCell className="font-medium">{pet.name}</TableCell>
                          <TableCell>{capitalizeFirst(pet.type)}</TableCell>
                          <TableCell>{formatAge(pet.age)}</TableCell>
                          <TableCell>
                            <Badge 
                              className={`px-2 py-1 rounded-full text-xs ${
                                pet.status === 'available' ? 'bg-green-100 text-green-800' :
                                pet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {capitalizeFirst(pet.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatLocation(pet.location)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(pet)}
                                className="text-coral hover:text-peach"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(pet.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications Management */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-coral" />
                Adoption Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Pet ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications?.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="text-gray-600">#{app.id}</TableCell>
                        <TableCell>{app.userId}</TableCell>
                        <TableCell>{app.petId}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`px-2 py-1 rounded-full text-xs ${
                              app.status === 'approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {capitalizeFirst(app.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationMutation.mutate({ id: app.id, status: 'approved' })}
                              disabled={app.status === 'approved'}
                              className="text-green-600 hover:bg-green-50"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationMutation.mutate({ id: app.id, status: 'rejected' })}
                              disabled={app.status === 'rejected'}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
