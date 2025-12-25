
import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

// Date utility functions
const formatDateToDDMMYYYY = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDDMMYYYYToISO = (ddmmyyyy) => {
  if (!ddmmyyyy || !ddmmyyyy.includes('/')) return "";
  try {
    const [day, month, year] = ddmmyyyy.split('/');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    return isoDate;
  } catch {
    return "";
  }
};

const validateDDMMYYYY = (value) => {
  if (!value || typeof value !== 'string') return false;
  const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (!pattern.test(value)) return false;
  
  const isoDate = parseDDMMYYYYToISO(value);
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

const LeaveApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    empCode: "",
    leaveType: "",
    reason: "",
    days: "",
    fromDate: "",
    toDate: "",
    timeSlot: "",
    department: "",
    approvalManager: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const leaveTypes = [
    "Sick leave (Illness or Injury)/बीमारी की छुट्टी (बीमारी या चोट)",
    "Personal leave/व्यक्तिगत अवकाश",
    "Emergency leave/आपातकालीन अवकाश",
    "Leave without pay/बिना वेतन छुट्टी",
  ];

  const timeSlots = [
    "Before Lunch Half day/लंच से पहले आधा दिन",
    "After Lunch Half day/लंच के बाद आधा दिन",
    "Full day/पूरा दिन",
  ];

  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      setFetchLoading(true);
      try {
        const response = await fetch("https://sales-attendance-leave.vercel.app/api/DropdownUserData");
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "API error");

        const formattedEmployees = data.data.map((item) => ({
          name: item["Names"] || "",
          empCode: item["EMP Code"] || "",
          leaveApprovalManager: item["Leave Approval Manager"] || "",
          department: item["Sites"] || "",
        }));

        setEmployees(formattedEmployees);
        const uniqueDepartments = [...new Set(
          formattedEmployees.map(emp => emp.department).filter(dept => dept && dept.trim())
        )];
        setDepartments(uniqueDepartments);
      } catch (error) {
        console.error("Error:", error);
        setErrorMessage(`Failed to load data: ${error.message}`);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchEmployeeData();
  }, []);

  // Calculate days
  const calculateDays = (fromDateStr, toDateStr, timeSlot) => {
    if (!fromDateStr || !toDateStr) return "";
    
    const fromISO = parseDDMMYYYYToISO(fromDateStr);
    const toISO = parseDDMMYYYYToISO(toDateStr);
    
    if (!fromISO || !toISO) return "";
    
    const fromDate = new Date(fromISO);
    const toDate = new Date(toISO);
    
    if (fromDate > toDate) return "";
    
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const isHalfDay = timeSlot && (
      timeSlot.includes("Half day") || timeSlot.includes("आधा दिन")
    );
    
    if (fromDateStr === toDateStr && isHalfDay) {
      return "0.5";
    }
    
    return diffDays.toString();
  };

  // Handle date picker change
  const handleDatePickerChange = (name, isoDate) => {
    if (!isoDate) {
      setFormData(prev => ({
        ...prev,
        [name]: "",
        days: ""
      }));
      setErrorMessage("");
      return;
    }
    
    const ddmmyyyy = formatDateToDDMMYYYY(isoDate);
    setFormData(prev => {
      const newData = { ...prev, [name]: ddmmyyyy };
      
      // Recalculate days
      if (name === "fromDate" || name === "toDate") {
        const otherDate = name === "fromDate" ? prev.toDate : prev.fromDate;
        newData.days = calculateDays(
          name === "fromDate" ? ddmmyyyy : otherDate,
          name === "toDate" ? ddmmyyyy : otherDate,
          prev.timeSlot
        );
      }
      
      return newData;
    });
    
    setErrorMessage("");
  };

  // Handle general input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (name === "name") {
        const selectedEmployee = employees.find(
          emp => emp.name && emp.name.toLowerCase() === value.toLowerCase()
        );
        newData.empCode = selectedEmployee?.empCode || "";
        newData.approvalManager = selectedEmployee?.leaveApprovalManager || "";
        newData.department = selectedEmployee?.department || "";
      }
      
      newData[name] = value;

      // Recalculate days for timeSlot change
      if (name === "timeSlot") {
        newData.days = calculateDays(newData.fromDate, newData.toDate, value);
      }
      
      return newData;
    });
    
    setErrorMessage("");
  };

  // Get min date for toDate (fromDate or today)
  const getToDateMin = () => {
    if (formData.fromDate) {
      return parseDDMMYYYYToISO(formData.fromDate);
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ["name", "leaveType", "reason", "fromDate", "toDate", "timeSlot", "department"];
    const missing = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missing.length > 0) {
      setErrorMessage(`Please fill: ${missing.join(", ")}`);
      return;
    }

    // Validate dates
    if (!validateDDMMYYYY(formData.fromDate) || !validateDDMMYYYY(formData.toDate)) {
      setErrorMessage("Please select valid dates");
      return;
    }

    const fromISO = parseDDMMYYYYToISO(formData.fromDate);
    const toISO = parseDDMMYYYYToISO(formData.toDate);
    const fromDate = new Date(fromISO);
    const toDate = new Date(toISO);
    
    if (fromDate > toDate) {
      setErrorMessage("To date must be after From date");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const submitData = {
        name: formData.name.trim(),
        empCode: formData.empCode.trim(),
        department: formData.department.trim(),
        fromDate: formData.fromDate.trim(), // DD/MM/YYYY format
        toDate: formData.toDate.trim(),     // DD/MM/YYYY format
        shift: formData.timeSlot.trim(),
        typeOfLeave: formData.leaveType.trim(),
        reason: formData.reason.trim(),
        days: formData.days || "0",
        approvalManager: formData.approvalManager.trim(),
      };

      console.log("Sending to backend:", submitData);

      const response = await fetch("https://sales-attendance-leave.vercel.app/api/leave-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }

      console.log("Success:", data);
      setSubmittedData(submitData);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        name: "", empCode: "", leaveType: "", reason: "", days: "",
        fromDate: "", toDate: "", timeSlot: "", department: "", approvalManager: ""
      });
      
    } catch (error) {
      console.error("Submit error:", error);
      setErrorMessage(`Submission failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "", empCode: "", leaveType: "", reason: "", days: "",
      fromDate: "", toDate: "", timeSlot: "", department: "", approvalManager: ""
    });
    setErrorMessage("");
    setSubmittedData(null);
    setShowSuccessModal(false);
  };

  const todayISO = new Date().toISOString().split('T')[0];
  const todayFormatted = formatDateToDDMMYYYY(todayISO);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-t-2xl p-6 text-center text-white">
          <img src="vrn8.png" className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 shadow-lg" alt="Logo" />
          <h1 className="text-3xl font-bold mb-2">Leave Request Form</h1>
          <p className="text-blue-100 text-sm">
            <strong>Date Format:</strong> DD/MM/YYYY (e.g., {todayFormatted})
          </p>
          <p className="text-xs text-blue-200 mt-1">
            Submit 3+ days in advance. Emergency leave only for same day.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-6 space-y-6">
          {fetchLoading && (
            <div className="p-4 bg-blue-100 border border-blue-300 rounded flex items-center gap-2 text-blue-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading employee data...
            </div>
          )}
          
          {errorMessage && (
            <div className="p-4 bg-red-100 border border-red-300 rounded flex items-center gap-2 text-red-700">
              <X className="w-5 h-5" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Employee Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4" /> Full Name *
                </label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={fetchLoading}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.empCode || emp.name} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" /> Employee Code
                </label>
                <input
                  type="text"
                  value={formData.empCode}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                  readOnly
                />
              </div>
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4" /> Leave Type *
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" /> Reason *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                placeholder="Enter detailed reason for leave..."
                required
              />
            </div>

            {/* Date Section with Date Pickers */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Leave Duration *
              </h3>
              <p className="text-sm text-blue-700">
                Select dates using calendar picker (displays as DD/MM/YYYY)
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">From Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={parseDDMMYYYYToISO(formData.fromDate)}
                      onChange={(e) => handleDatePickerChange("fromDate", e.target.value)}
                      min={todayISO}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {formData.fromDate && (
                      <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                        <span className="text-sm text-gray-500">
                          {formData.fromDate}
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="hidden"
                    value={formData.fromDate}
                    name="fromDate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">To Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={parseDDMMYYYYToISO(formData.toDate)}
                      onChange={(e) => handleDatePickerChange("toDate", e.target.value)}
                      min={getToDateMin()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {formData.toDate && (
                      <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                        <span className="text-sm text-gray-500">
                          {formData.toDate}
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="hidden"
                    value={formData.toDate}
                    name="toDate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Days</label>
                  <input
                    type="text"
                    value={formData.days}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-green-50 text-green-700 font-semibold"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Time Slot & Department */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4" /> Time Slot *
                </label>
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4" /> Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={!departments.length || fetchLoading}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4" /> Approval Manager
              </label>
              <input
                type="text"
                value={formData.approvalManager}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                readOnly
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || fetchLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:w-auto bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-all"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccessModal && submittedData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
                <p className="text-gray-600 mb-4">Leave application submitted successfully!</p>
                <div className="bg-green-50 p-4 rounded-lg text-left mb-4">
                  <p className="font-semibold">Details:</p>
                  <p><strong>From:</strong> {submittedData.fromDate}</p>
                  <p><strong>To:</strong> {submittedData.toDate}</p>
                  <p><strong>Days:</strong> {submittedData.days}</p>
                  <p className="text-xs text-gray-500 mt-2">Pending manager approval</p>
                </div>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSubmittedData(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg w-full transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApplicationForm;