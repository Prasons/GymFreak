import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mock data for training schedules
let mockSchedules = [
  {
    id: 1,
    title: "Morning Yoga",
    description: "Gentle yoga session for all levels",
    start_time: "2023-06-01T08:00:00Z",
    end_time: "2023-06-01T09:00:00Z",
    trainer_id: 1,
    trainer_name: "Alex Johnson",
    max_participants: 15,
    current_participants: 8,
    status: "scheduled",
    created_at: "2023-05-20T10:00:00Z"
  },
  {
    id: 2,
    title: "HIIT Workout",
    description: "High intensity interval training",
    start_time: "2023-06-01T17:00:00Z",
    end_time: "2023-06-01T18:00:00Z",
    trainer_id: 2,
    trainer_name: "Sarah Williams",
    max_participants: 20,
    current_participants: 15,
    status: "scheduled",
    created_at: "2023-05-21T09:30:00Z"
  }
];

// Mock API functions
const getTrainingSchedules = async () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([...mockSchedules]), 500);
  });
};

const createTrainingSchedule = async (schedule) => {
  return new Promise(resolve => {
    const newSchedule = {
      ...schedule,
      id: Math.max(0, ...mockSchedules.map(s => s.id)) + 1,
      created_at: new Date().toISOString(),
      current_participants: 0,
      status: "scheduled"
    };
    mockSchedules.push(newSchedule);
    setTimeout(() => resolve(newSchedule), 300);
  });
};

const updateTrainingSchedule = async (id, updates) => {
  return new Promise((resolve, reject) => {
    const index = mockSchedules.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSchedules[index] = { ...mockSchedules[index], ...updates };
      setTimeout(() => resolve(mockSchedules[index]), 300);
    } else {
      reject(new Error('Schedule not found'));
    }
  });
};

const deleteTrainingSchedule = async (id) => {
  return new Promise((resolve) => {
    const initialLength = mockSchedules.length;
    mockSchedules = mockSchedules.filter(s => s.id !== id);
    if (mockSchedules.length < initialLength) {
      setTimeout(() => resolve({ success: true }), 300);
    } else {
      throw new Error('Schedule not found');
    }
  });
};

// Mock auth functions
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('adminInfo') || 'null');
  return !!user && user.role === 'admin';
};

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('adminInfo') || 'null');
  return user || null;
};

const emptyForm = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  trainer_id: "",
  max_participants: 10,
  status: "scheduled",
};

const AdminTrainingSchedule = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          toast.error("You must be logged in to access this page");
          navigate("/admin/login");
          return;
        }

        setCurrentUser(user);
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);

        if (!adminStatus) {
          toast.error("You do not have permission to access this page");
          navigate("/dashboard");
          return;
        }

        await fetchSchedules();
      } catch (error) {
        console.error("Error initializing training schedule page:", error);
        toast.error("Error initializing page");
        navigate("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const data = await getTrainingSchedules(params);

      const formattedData = data.map((schedule) => ({
        ...schedule,
        start_time: schedule.start_time
          ? new Date(schedule.start_time).toISOString().slice(0, 16)
          : "",
        end_time: schedule.end_time
          ? new Date(schedule.end_time).toISOString().slice(0, 16)
          : "",
      }));

      setSchedules(formattedData);
      setTotalItems(data?.length);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to load schedules";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    if (isAdminUser) {
      fetchSchedules();
    }
  }, [isAdminUser, fetchSchedules]);

  const handleSearch = useCallback(
    (e) => {
      e?.preventDefault();
      setCurrentPage(1);
      fetchSchedules();
    },
    [fetchSchedules]
  );

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  useEffect(() => {
    if (searchTerm || statusFilter !== "all") {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let inputValue;
    if (type === "number") {
      inputValue = value === "" ? "" : parseInt(value, 10);
    } else if (type === "checkbox") {
      inputValue = e.target.checked;
    } else {
      inputValue = value;
    }

    setForm((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title?.trim()) {
      errors.title = "Title is required";
    } else if (form.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (!form.start_time) {
      errors.start_time = "Start time is required";
    }

    if (!form.end_time) {
      errors.end_time = "End time is required";
    } else if (
      form.start_time &&
      new Date(form.end_time) <= new Date(form.start_time)
    ) {
      errors.end_time = "End time must be after start time";
    }

    if (
      form.max_participants &&
      (isNaN(form.max_participants) || form.max_participants < 1)
    ) {
      errors.max_participants = "Must be at least 1";
    }

    return errors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (touched[field]) {
      const errors = validateForm();
      setFormErrors((prev) => ({ ...prev, [field]: errors[field] || "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(form).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    );
    setTouched(allTouched);

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editing) {
        await updateTrainingSchedule(editing, form);
        toast.success("Schedule updated successfully");
      } else {
        await createTrainingSchedule(form);
        toast.success("Schedule created successfully");
      }

      setForm(emptyForm);
      setEditing(null);
      setTouched({});
      await fetchSchedules();
    } catch (err) {
      console.error("Error saving schedule:", err);
      const errorMsg = err.response?.data?.message || "Failed to save schedule";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditing(schedule);
    setForm({
      title: schedule.title || "",
      description: schedule.description || "",
      start_time: schedule.start_time
        ? new Date(schedule.start_time).toISOString().slice(0, 16)
        : "",
      end_time: schedule.end_time
        ? new Date(schedule.end_time).toISOString().slice(0, 16)
        : "",
      trainer_id: schedule.trainer_id || "",
      max_participants: schedule.max_participants || 10,
      status: schedule.status || "scheduled",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;

    try {
      setLoading(true);
      await deleteTrainingSchedule(scheduleToDelete.id);
      toast.success("Schedule deleted successfully");
      await fetchSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete schedule";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setScheduleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
  };

  const formatDateTimeDisplay = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-training-schedule">
      {/* You can now render form, search, filters, pagination, and schedule list here */}
      {/* This JSX part should be implemented based on your UI preferences */}
    </div>
  );
};

export default AdminTrainingSchedule;
