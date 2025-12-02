"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface CompanyInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyData: CompanyInvoiceData) => void;
}

export interface CompanyInvoiceData {
  companyName: string;
  companyRegister: string;
  phoneNumber: string;
  email?: string;
}

export default function CompanyInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
}: CompanyInvoiceModalProps) {
  const [formData, setFormData] = useState<CompanyInvoiceData>({
    companyName: "",
    companyRegister: "",
    phoneNumber: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.companyName || !formData.companyRegister) {
      alert("Company name and register number are required");
      return;
    }
    onSubmit(formData);
    setFormData({
      companyName: "",
      companyRegister: "",
      phoneNumber: "",
      email: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Company Invoice Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <Label htmlFor="companyRegister" className="text-sm font-medium">
              Company Register Number
            </Label>
            <Input
              id="companyRegister"
              name="companyRegister"
              value={formData.companyRegister}
              onChange={handleChange}
              placeholder="Enter register number"
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email (Optional)
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Continue to Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
