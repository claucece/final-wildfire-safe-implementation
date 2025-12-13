import { useState } from "react";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export const useForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  // Only update relevant part of form data on change
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,  // Retain previous values
      [field]: value,  // Update the changed field
    }));
  };

  return {
    formData,
    handleInputChange,
  };
};
