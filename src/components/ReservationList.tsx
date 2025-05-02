import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { Reservation, UpdateReservationRequest } from "../pages/Dashboard";
import EditReservationForm from "./EditReservationForm";

interface ReservationListProps {
  reservations: Reservation[];
  isLoading: boolean;
  onUpdate: (reservation: UpdateReservationRequest) => void;
  onDelete: (id: number) => void;
}

const ReservationList = ({
  reservations,
  isLoading,
  onUpdate,
  onDelete,
}: ReservationListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = (updatedReservation: UpdateReservationRequest) => {
    onUpdate(updatedReservation);
    setEditingId(null);
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      return format(new Date(dateTimeStr), "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateTimeStr;
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading reservations...</div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No reservations found. Make your first one!
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              {editingId === reservation.id ? (
                <TableCell colSpan={5}>
                  <EditReservationForm
                    reservation={reservation}
                    onSubmit={handleUpdate}
                    onCancel={handleCancelEdit}
                  />
                </TableCell>
              ) : (
                <>
                  <TableCell className="font-medium">
                    {reservation.name}
                  </TableCell>
                  <TableCell>{reservation.description}</TableCell>
                  <TableCell>{formatDateTime(reservation.startAt)}</TableCell>
                  <TableCell>{formatDateTime(reservation.endAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        reservation.id && handleEdit(reservation.id)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => reservation.id && onDelete(reservation.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReservationList;
