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
import { CreateReservationRequest } from "../pages/Dashboard";

interface CreateReservationFormProps {
  onSubmit: (data: CreateReservationRequest) => void;
  onCancel: () => void;
}

const reservationSchema = z
  .object({
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

type FormValues = z.infer<typeof reservationSchema>;

const CreateReservationForm = ({
  onSubmit,
  onCancel,
}: CreateReservationFormProps) => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const formatForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      description: "",
      startAt: formatForInput(now),
      endAt: formatForInput(oneHourLater),
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
      <h2 className="text-xl font-bold mb-4">New Reservation</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Team match" {...field} />
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
                  <Textarea
                    placeholder="Brief description of the reservation"
                    {...field}
                  />
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
            <Button type="submit">Create Reservation</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateReservationForm;
