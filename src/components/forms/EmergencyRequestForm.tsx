"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Location } from '@/lib/types';

interface EmergencyRequestFormProps {
  onSubmit: (data: EmergencyRequestFormData) => void;
  defaultLocation?: Location;
  isLoading?: boolean;
}

export interface EmergencyRequestFormData {
  description: string;
  location: Location;
}

export function EmergencyRequestForm({ 
  onSubmit, 
  defaultLocation = { latitude: 0, longitude: 0 },
  isLoading = false
}: EmergencyRequestFormProps) {
  const form = useForm<EmergencyRequestFormData>({
    defaultValues: {
      description: '',
      location: defaultLocation
    }
  });

  // Get current location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your emergency situation"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include relevant details about your condition or situation
              </FormDescription>
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Requesting Emergency Services...' : 'Request Emergency Services'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 