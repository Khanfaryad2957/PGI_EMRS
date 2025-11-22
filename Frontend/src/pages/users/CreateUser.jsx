import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { useCreateUserMutation, useUpdateUserMutation } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { USER_ROLES } from '../../utils/constants';

const CreateUser = ({ editMode = false, existingUser = null, userId = null }) => {
  const navigate = useNavigate();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isLoading = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (editMode && existingUser) {
      setFormData({
        name: existingUser.name || '',
        email: existingUser.email || '',
        mobile: existingUser.mobile || '',
        password: '',
        confirmPassword: '',
        role: existingUser.role || '',
      });
    }
  }, [editMode, existingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits and start with 6-9';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation - required for create, optional for edit
    if (!editMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    } else {
      // In edit mode, if password is provided, validate it
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    // Only validate confirm password if password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (editMode) {
        // For edit mode, only send fields that can be updated (name, email, role)
        // Password is handled separately via reset-password endpoint
        const { password, confirmPassword, ...submitData } = formData;
        await updateUser({ id: userId, ...submitData }).unwrap();
        toast.success('User updated successfully!');
      } else {
        // For create mode, include password
        const { confirmPassword, ...submitData } = formData;
        await createUser(submitData).unwrap();
        toast.success('User created successfully!');
      }
      navigate('/users');
    } catch (err) {
      toast.error(err?.data?.message || (editMode ? 'Failed to update user' : 'Failed to create user'));
    }
  };

  const roleOptions = Object.entries(USER_ROLES).map(([key, value]) => ({
    value,
    label: value,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="w-full space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/users">
              <Button variant="ghost" size="sm">
                <FiArrowLeft className="mr-2" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editMode ? 'Edit User' : 'Create New User'}
              </h1>
              <p className="text-gray-600 mt-1">
                {editMode ? 'Update user information' : 'Add a new system user'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
              <div className="space-y-6 p-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  error={errors.name}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@pgimer.edu.in"
                  error={errors.email}
                  required
                />

                <Select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={roleOptions}
                  error={errors.role}
                  required
                />
                <Input
                  label="Mobile Number"
                  type="number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  error={errors.mobile}
                  required
                />


                {!editMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      error={errors.password}
                      required
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      error={errors.confirmPassword}
                      required
                    />
                  </div>
                )}
                {editMode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> To change the user's password, use the password reset feature from the user management page.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/users')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={isLoading}>
                    {editMode ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;

