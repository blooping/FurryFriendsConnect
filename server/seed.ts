import { db } from "./db";
import { pets } from "@shared/schema";

const samplePets = [
  {
    name: "Buddy",
    type: "dog",
    breed: "Golden Retriever",
    age: "2 years",
    gender: "male",
    description: "Friendly and energetic pup who loves playing fetch and meeting new people! Buddy is great with kids and other dogs. He's house-trained and knows basic commands.",
    location: "San Francisco, CA",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    status: "available",
    personality: {
      energyLevel: "High",
      goodWithKids: true,
      goodWithPets: true,
      trainingLevel: "Basic commands"
    },
    careNeeds: {
      exerciseNeeds: "High - 2+ hours daily",
      groomingNeeds: "Moderate - weekly brushing",
      specialNeeds: "None"
    }
  },
  {
    name: "Luna",
    type: "cat",
    breed: "Orange Tabby",
    age: "3 years",
    gender: "female",
    description: "Sweet and gentle cat who loves cuddles and sunny window spots. Luna is perfect for a quiet home and gets along well with other cats.",
    location: "Oakland, CA",
    imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    status: "available",
    personality: {
      energyLevel: "Low",
      goodWithKids: true,
      goodWithPets: true,
      temperament: "Calm and affectionate"
    },
    careNeeds: {
      exerciseNeeds: "Low - indoor play",
      groomingNeeds: "Low - self-grooming",
      specialNeeds: "Prefers quiet environments"
    }
  },
  {
    name: "Max",
    type: "dog",
    breed: "Mixed Breed",
    age: "5 years",
    gender: "male",
    description: "Calm and loyal companion, perfect for quiet evenings and short walks. Max is a gentle soul who would do well with seniors or a calm household.",
    location: "Berkeley, CA",
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    status: "available",
    personality: {
      energyLevel: "Low",
      goodWithKids: true,
      goodWithPets: false,
      temperament: "Calm and gentle"
    },
    careNeeds: {
      exerciseNeeds: "Low - short daily walks",
      groomingNeeds: "Low - occasional brushing",
      specialNeeds: "Prefers to be the only pet"
    }
  },
  {
    name: "Whiskers",
    type: "cat",
    breed: "Siamese",
    age: "1 year",
    gender: "male",
    description: "Playful and vocal young cat who loves attention and interactive toys. Whiskers is very intelligent and would benefit from puzzle feeders and climbing trees.",
    location: "San Jose, CA",
    imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    status: "available",
    personality: {
      energyLevel: "High",
      goodWithKids: true,
      goodWithPets: false,
      temperament: "Playful and vocal"
    },
    careNeeds: {
      exerciseNeeds: "High - interactive play",
      groomingNeeds: "Low - short hair",
      specialNeeds: "Mental stimulation needed"
    }
  },
  {
    name: "Bella",
    type: "dog",
    breed: "Labrador Mix",
    age: "4 years",
    gender: "female",
    description: "Sweet and well-trained dog who loves swimming and hiking. Bella is great with families and has lots of love to give. She's spayed and up to date on all vaccines.",
    location: "Palo Alto, CA",
    imageUrl: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    status: "pending",
    personality: {
      energyLevel: "Moderate",
      goodWithKids: true,
      goodWithPets: true,
      trainingLevel: "Well-trained"
    },
    careNeeds: {
      exerciseNeeds: "Moderate - daily walks and play",
      groomingNeeds: "Moderate - regular brushing",
      specialNeeds: "Loves water activities"
    }
  },
  {
    name: "Oliver",
    type: "rabbit",
    breed: "Holland Lop",
    age: "2 years",
    gender: "male",
    description: "Gentle and curious rabbit who enjoys hopping around and munching on fresh vegetables. Oliver is litter-trained and loves to explore safe spaces.",
    location: "Mountain View, CA",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    status: "available",
    personality: {
      energyLevel: "Moderate",
      goodWithKids: true,
      goodWithPets: true,
      temperament: "Gentle and curious"
    },
    careNeeds: {
      exerciseNeeds: "Moderate - daily supervised exercise",
      groomingNeeds: "High - regular brushing",
      specialNeeds: "Requires hay and fresh vegetables"
    }
  },
  {
    name: "Charlie",
    type: "bird",
    breed: "Cockatiel",
    age: "3 years",
    gender: "male",
    description: "Friendly and social bird who loves to whistle and interact with people. Charlie knows several tunes and enjoys perching on shoulders.",
    location: "Santa Clara, CA",
    imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    status: "available",
    personality: {
      energyLevel: "Moderate",
      goodWithKids: true,
      goodWithPets: false,
      temperament: "Social and vocal"
    },
    careNeeds: {
      exerciseNeeds: "Moderate - out-of-cage time daily",
      groomingNeeds: "Low - self-grooming",
      specialNeeds: "Social interaction and mental stimulation"
    }
  },
  {
    name: "Mittens",
    type: "cat",
    breed: "Maine Coon",
    age: "6 years",
    gender: "female",
    description: "Large, fluffy, and incredibly gentle cat who acts more like a dog. Mittens loves to follow her humans around and is great with children and other pets.",
    location: "Fremont, CA",
    imageUrl: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    status: "available",
    personality: {
      energyLevel: "Low",
      goodWithKids: true,
      goodWithPets: true,
      temperament: "Gentle giant, dog-like"
    },
    careNeeds: {
      exerciseNeeds: "Low - gentle play",
      groomingNeeds: "High - daily brushing required",
      specialNeeds: "Large space and sturdy furniture"
    }
  }
];

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample pets...");
    
    // Clear existing pets (optional - uncomment if you want to reset)
    // await db.delete(pets);
    
    // Insert sample pets
    const insertedPets = await db.insert(pets).values(samplePets).returning();
    
    console.log(`Successfully seeded ${insertedPets.length} pets to the database`);
    
    insertedPets.forEach(pet => {
      console.log(`- ${pet.name} (${pet.type}) - ID: ${pet.id}`);
    });
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Database seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database seeding failed:", error);
      process.exit(1);
    });
}
