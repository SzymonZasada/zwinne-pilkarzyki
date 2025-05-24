import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateReservationForm from "../components/CreateReservationForm";
import ReservationList from "../components/ReservationList";
import { useAuth } from "../contexts/AuthContext";

export interface Reservation {
  id?: number;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
}

export interface CreateReservationRequest {
  name: string;
  description: string;
  startAt: string;
  endAt: string;
}

export interface UpdateReservationRequest {
  id: number;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  lastName: string;
}

const Dashboard = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
    fetchReservations();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get<User>("http://localhost:8080/auth/info");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
      toast.error("Failed to load user information", {
        description: "Please try refreshing the page",
      });
    }
  };

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Reservation[]>(
        "http://localhost:8080/reservations"
      );
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateReservation = async (
    newReservation: CreateReservationRequest
  ) => {
    try {
      const response = await axios.post<Reservation>(
        "http://localhost:8080/reservations",
        newReservation
      );

      toast.success("Reservation created", {
        description: "Your reservation has been created successfully",
      });

      setReservations([...reservations, response.data]);
      setShowCreateForm(false);
    } catch (error: any) {
      console.error("Error creating reservation:", error);

      if (error.response?.status === 400) {
        toast.error("Time slot unavailable", {
          description:
            "Someone has already reserved this time slot. Please choose a different time.",
        });
      } else {
        toast.error("Failed to create reservation", {
          description:
            error.response?.data?.message || "Please try again later",
        });
      }
    }
  };

  const handleUpdateReservation = async (
    updatedReservation: UpdateReservationRequest
  ) => {
    try {
      const response = await axios.put<Reservation>(
        "http://localhost:8080/reservations",
        updatedReservation
      );

      toast.success("Reservation updated", {
        description: "Your reservation has been updated successfully",
      });

      setReservations(
        reservations.map((reservation) =>
          reservation.id === updatedReservation.id ? response.data : reservation
        )
      );
    } catch (error: any) {
      console.error("Error updating reservation:", error);

      if (error.response?.status === 400) {
        toast.error("Time slot unavailable", {
          description:
            "Someone has already reserved this time slot. Please choose a different time.",
        });
      } else {
        toast.error("Failed to update reservation", {
          description:
            error.response?.data?.message || "Please try again later",
        });
      }
    }
  };

  const handleDeleteReservation = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/reservations/${id}`);

      toast.success("Reservation deleted", {
        description: "Your reservation has been deleted successfully",
      });

      setReservations(
        reservations.filter((reservation) => reservation.id !== id)
      );
    } catch (error: any) {
      console.error("Error deleting reservation:", error);
      toast.error("Failed to delete reservation", {
        description: error.response?.data?.message || "Please try again later",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Foosball Reservations</h1>
            {user && (
              <p className="text-lg text-gray-600 mt-1">
                Hi, {user.name} {user.lastName}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Reservations</CardTitle>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? "Cancel" : "Make Reservation"}
              </Button>
            </CardHeader>
            <CardContent>
              {showCreateForm ? (
                <CreateReservationForm
                  onSubmit={handleCreateReservation}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <ReservationList
                  reservations={reservations}
                  isLoading={isLoading}
                  onUpdate={handleUpdateReservation}
                  onDelete={handleDeleteReservation}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
