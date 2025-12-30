"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Switch,
  Avatar,
  addToast,
} from "@heroui/react";
import { IconX, IconCheck, IconUpload } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { UserRole } from "@/generated/prisma";
import { useMutate } from "@/hooks/use-mutate";
import { uploadToCloudinary } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  color?: string;
}

interface UserFormProps {
  user?: any;
  onSuccess: () => void;
  onCancel: () => void;
  departments: Department[];
}

export function UserForm({
  user,
  onSuccess,
  onCancel,
  departments,
}: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.imageUrl || null
  );
  const { mutateAsync } = useMutate({});

  // Set default values
  const defaultValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    role: user?.role || UserRole.STAFF,
    departmentId: user?.departmentId || "",
    imageUrl: user?.imageUrl || "",
    isActive: user?.isActive ?? true,
    isVerified: user?.isVerified ?? false,
    isLocked: user?.isLocked ?? false,
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await handleSubmit(value);
    },
  });

  useEffect(() => {
    if (!isInitialized && departments.length > 0) {
      form.reset();
      setIsInitialized(true);
    }
  }, [departments, isInitialized]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file);
      if (result.secure_url) {
        form.setFieldValue("imageUrl", result.secure_url);
        setImagePreview(result.secure_url);
        addToast({ title: "Image uploaded successfully" });
      }
    } catch (error: any) {
      addToast({
        title: error.message || "Failed to upload image",
        color: "danger",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Validate passwords match if creating new user or changing password
      if (!user || data.password) {
        if (data.password !== data.confirmPassword) {
          throw new Error("Passwords do not match");
        }
      }

      // Remove confirmPassword from payload
      const { confirmPassword, ...payload } = data;

      // If no password change for existing user, remove password field
      if (user && !data.password) {
        delete payload.password;
      }

      const url = user ? `/users/${user.id}` : "/users";
      const method = user ? "PUT" : "POST";

      const response = await mutateAsync({
        method,
        endPoint: url,
        variables: payload,
      });

      if (response?.error) {
        if (typeof response?.error === "string") {
          throw new Error(response.error);
        } else {
          throw response.error;
        }
      }

      if (response.message) {
        addToast({ title: response.message });
        onSuccess();
      } else {
        addToast({
          title: response.error || "Failed to save user",
          color: "danger",
        });
      }
    } catch (error: any) {
      addToast({
        title: error.message || "Failed to save user",
        color: "danger",
      });
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const roles = Object.values(UserRole);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {user ? "Edit User" : "Add New User"}
        </h2>
        <Button isIconOnly size="sm" variant="light" onPress={onCancel}>
          <IconX className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <Avatar
              size="lg"
              name={`${form.getFieldValue("firstName")?.[0] || ""}${
                form.getFieldValue("lastName")?.[0] || ""
              }`}
              src={imagePreview || undefined}
              className="w-24 h-24 text-2xl mb-4"
            />
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
            />
            <Button
              variant="flat"
              onPress={() => document.getElementById("image-upload")?.click()}
              isLoading={uploadingImage}
              startContent={
                !uploadingImage && <IconUpload className="w-4 h-4" />
              }
            >
              {imagePreview ? "Change Image" : "Upload Image"}
            </Button>
            {imagePreview && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                className="mt-2"
                onPress={() => {
                  setImagePreview(null);
                  form.setFieldValue("imageUrl", "");
                }}
              >
                Remove Image
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <form.Field name="firstName">
              {(field) => (
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                />
              )}
            </form.Field>

            {/* Last Name */}
            <form.Field name="lastName">
              {(field) => (
                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                />
              )}
            </form.Field>
          </div>

          {/* Email */}
          <form.Field name="email">
            {(field) => (
              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                isInvalid={field.state.meta.errors.length > 0}
                errorMessage={field.state.meta.errors.join(", ")}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <form.Field name="password">
              {(field) => (
                <Input
                  label={user ? "New Password (Optional)" : "Password"}
                  type="password"
                  placeholder="Enter password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                  description={
                    user
                      ? "Leave blank to keep current password"
                      : "Minimum 6 characters"
                  }
                />
              )}
            </form.Field>

            {/* Confirm Password */}
            <form.Field name="confirmPassword">
              {(field) => (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <form.Field name="role">
              {(field) => (
                <Select
                  label="Role"
                  placeholder="Select role"
                  selectedKeys={[field.state.value]}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as UserRole;
                    field.handleChange(key);
                  }}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                >
                  {roles.map((role) => (
                    <SelectItem key={role}>
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </form.Field>

            {/* Department */}
            <form.Field name="departmentId">
              {(field) => (
                <Select
                  label="Department (Optional)"
                  placeholder="Select department"
                  selectedKeys={field.state.value ? [field.state.value] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;
                    field.handleChange(key || "");
                  }}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                  items={[
                    {
                      id: "",
                      name: "No Department",
                    },
                    ...departments,
                  ]}
                >
                  {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
                </Select>
              )}
            </form.Field>
          </div>

          {/* Status Switches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form.Field name="isActive">
              {(field) => (
                <Switch
                  isSelected={field.state.value}
                  onValueChange={field.handleChange}
                  classNames={{
                    base: "flex items-center justify-between w-full",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">Active</p>
                    <p className="text-tiny text-default-400">
                      User can access the system
                    </p>
                  </div>
                </Switch>
              )}
            </form.Field>

            <form.Field name="isVerified">
              {(field) => (
                <Switch
                  isSelected={field.state.value}
                  onValueChange={field.handleChange}
                  classNames={{
                    base: "flex items-center justify-between w-full",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">Verified</p>
                    <p className="text-tiny text-default-400">
                      Email is verified
                    </p>
                  </div>
                </Switch>
              )}
            </form.Field>

            <form.Field name="isLocked">
              {(field) => (
                <Switch
                  isSelected={field.state.value}
                  onValueChange={field.handleChange}
                  classNames={{
                    base: "flex items-center justify-between w-full",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">Locked</p>
                    <p className="text-tiny text-default-400">
                      Prevent user login
                    </p>
                  </div>
                </Switch>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="light"
              onPress={onCancel}
              isDisabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              startContent={!loading && <IconCheck className="w-4 h-4" />}
            >
              {user ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
