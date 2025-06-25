import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Pets from "@/pages/pets";
import PetDetail from "@/pages/pet-detail";
import AIMatching from "@/pages/ai-matching";
import SubmitPet from "@/pages/submit-pet";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import AIChat from "@/components/ai-chat";
import Profile from "@/pages/profile";
import PetCarePage from "@/pages/pet-care";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pets" component={Pets} />
      <Route path="/pets/:id" component={PetDetail} />
      <Route path="/ai-matching" component={AIMatching} />
      <Route path="/submit-pet" component={SubmitPet} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/pet-care" component={PetCarePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <AIChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
