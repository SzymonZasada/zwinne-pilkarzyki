import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Reservation, UpdateReservationRequest } from "../pages/Dashboard";

interface EditReservationFormProps {
  reservation: Reservation;
  onSubmit: (data: UpdateReservationRequest) => void;
  onCancel: () => void;
}

const editReservationSchema = z
  .object({
    id: z.number(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    startAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Start time must be a valid date and time",
    }),
    endAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "End time must be a valid date and time",
    }),
  })
  .refine((data) => new Date(data.startAt) < new Date(data.endAt), {
    message: "End time must be later than start time",
    path: ["endAt"],
  });

type FormValues = z.infer<typeof editReservationSchema>;

const EditReservationForm = ({
  reservation,
  onSubmit,
  onCancel,
}: EditReservationFormProps) => {
  const formatForInput = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    } catch {
      return dateStr;
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(editReservationSchema),
    defaultValues: {
      id: reservation.id!,
      name: reservation.name,
      description: reservation.description,
      startAt: formatForInput(reservation.startAt),
      endAt: formatForInput(reservation.endAt),
    },
  });

  const handleSubmit = (values: FormValues) => {
    const formattedValues = {
      ...values,
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
    };

    onSubmit(formattedValues);
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-50">
      <h2 className="text-xl font-bold mb-4">Edit Reservation</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Update Reservation</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditReservationForm;
