
// import { useState, useEffect, useRef } from "react";
// import { Camera, MapPin, Clock, User, Mail, Building, CheckCircle, XCircle, Loader2 } from "lucide-react";

// function AttendanceForm() {
//   const [formData, setFormData] = useState({
//     email: "",
//     name: "",
//     empCode: "",
//     site: "",
//     entryType: "",
//     workShift: "",
//     locationName: "",
//     image: null,
//   });

//   const [userData, setUserData] = useState([]);
//   const [filteredEmails, setFilteredEmails] = useState([]);
//   const [filteredSites, setFilteredSites] = useState([]);
//   const [nearbyOffices, setNearbyOffices] = useState([]);
//   const [isCameraOpen, setIsCameraOpen] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [attendanceStatus, setAttendanceStatus] = useState({
//     hasCheckedIn: false,
//     hasCheckedOut: false,
//   });
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isDataLoading, setIsDataLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
//   const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const offices = [
//     { name: "Home", lat: 23.231878, lng: 77.455833 },
//     { name: "Office/कार्यालय", lat: 23.19775059819785, lng: 77.41701272524529 },
//     { name: "RNTU/आरएनटीयू", lat: 23.130614, lng: 77.565729 },
//     { name: "Dubey Ji Site/दुबे जी साइट", lat: 23.124046, lng: 77.497393 },
//     { name: "Regional Center West", lat: 37.7749, lng: -122.4208 },
//     { name: "Satellite Office 1", lat: 37.776, lng: -122.4194 },
//     { name: "Satellite Office 2", lat: 37.7738, lng: -122.4194 },
//     { name: "Admin Building", lat: 37.7752, lng: -122.42 },
//     { name: "Tech Hub", lat: 37.7745, lng: -122.4188 },
//     { name: "Support Center", lat: 37.78, lng: -122.41 },
//   ];

//   const isSpecificRCC = formData.site.toLowerCase() === "rcc office/आरसीसी कार्यालय".toLowerCase();

//   const fetchAttendanceStatus = async (email) => {
//     if (!email || typeof email !== 'string' || !userData.some((user) => user.email && user.email.toLowerCase() === email.toLowerCase())) {
//       setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
//       return;
//     }

//     try {
//       const now = new Date();
//       const istOptions = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
//       const yyyyMMddFormatter = new Intl.DateTimeFormat("en-CA", istOptions);
//       const [year, month, day] = yyyyMMddFormatter.format(now).split('-');
//       const yyyyMMddDate = `${year}-${month}-${day}`;

//       let url = `https://sales-attendance-leave.vercel.app/api/attendance?email=${encodeURIComponent(email)}&date=${yyyyMMddDate}`;
//       let response = await fetch(url, { cache: 'no-store' });

//       let records = [];
//       if (!response.ok) {
//         const ddMMyyyyFormatter = new Intl.DateTimeFormat("en-IN", istOptions);
//         const ddMMyyyyDate = ddMMyyyyFormatter.format(now);
//         url = `https://sales-attendance-leave.vercel.app/api/attendance?email=${encodeURIComponent(email)}&date=${ddMMyyyyDate}`;
//         response = await fetch(url, { cache: 'no-store' });
//         if (!response.ok) throw new Error("Failed to fetch attendance");
//       }

//       records = await response.json();

//       const hasCheckedIn = records.some((record) => 
//         record.EntryType?.trim().toLowerCase() === "in" && 
//         record.site?.trim().toLowerCase() === "rcc office/आरसीसी कार्यालय".toLowerCase()
//       );

//       const hasCheckedOut = records.some((record) => 
//         record.EntryType?.trim().toLowerCase() === "out" && 
//         record.site?.trim().toLowerCase() === "rcc office/आरसीसी कार्यालय".toLowerCase()
//       );

//       setAttendanceStatus({ hasCheckedIn, hasCheckedOut });
//     } catch (error) {
//       console.error("Error fetching attendance status:", error);
//       setErrorMessage(`Error fetching attendance status: ${error.message}`);
//       setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
//     }
//   };

//   useEffect(() => {
//     const init = async () => {
//       try {
//         setIsDataLoading(true);
//         const res = await fetch("https://sales-attendance-leave.vercel.app/api/DropdownUserData", { cache: 'no-store' });
//         const apiData = await res.json();

//         if (!apiData.success) throw new Error(apiData.error || "Failed to fetch user data");

//         const normalizedData = apiData.data.map((row) => ({
//           name: row["Names"] || "",
//           empCode: row["EMP Code"] || "",
//           mobile: row["Mobile No."] || "",
//           email: row["Email"] || "",
//           site: row["Sites"] || "",
//         }));

//         const usersWithEmail = normalizedData.filter((user) => user.email && typeof user.email === 'string');
//         setUserData(usersWithEmail);
//         setFilteredEmails(usersWithEmail);

//         const uniqueSites = [...new Set(normalizedData.map((u) => u.site).filter((s) => s && s !== "N/A"))];
//         setFilteredSites(uniqueSites);
//       } catch (error) {
//         setErrorMessage("Failed to load user data. Please try again later.");
//       } finally {
//         setIsDataLoading(false);
//       }
//     };
//     init();
//   }, []);

//   useEffect(() => {
//     if (formData.email && isSpecificRCC) {
//       fetchAttendanceStatus(formData.email);
//     } else {
//       setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
//     }
//   }, [formData.email, formData.site]);

//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       entryType: "",
//       locationName: "",
//       image: null,
//     }));
//     setCapturedImage(null);
//     setNearbyOffices([]);
//   }, [formData.email]);

//   // 5-minute auto refresh
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       window.location.reload();
//     }, 5 * 60 * 1000);
//     return () => clearTimeout(timer);
//   }, []);

//   const handleEmailSelect = (email) => {
//     const storedEmail = localStorage.getItem('userEmail');
//     if (storedEmail && storedEmail.toLowerCase() !== email.toLowerCase()) {
//       setErrorMessage("Another email is already used for today's attendance. Please use the same email.");
//       return;
//     }

//     const user = userData.find((u) => u.email.toLowerCase() === email.toLowerCase());
//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         email: user.email,
//         name: user.name,
//         empCode: user.empCode,
//         site: user.site,
//         entryType: "",
//         workShift: "",
//         locationName: "",
//         image: null,
//       }));
//       setIsEmailDropdownOpen(false);
//       setErrorMessage("");
//       localStorage.setItem('userEmail', user.email);
//       fetchAttendanceStatus(user.email);
//     }
//   };

//   const handleEmailSearch = (e) => {
//     const val = e.target.value;
//     setFormData((prev) => ({ ...prev, email: val }));
//     const filtered = val ? userData.filter(u => u.email.toLowerCase().includes(val.toLowerCase())) : userData;
//     setFilteredEmails(filtered);
//     setIsEmailDropdownOpen(true);
//   };

//   const handleSiteSelect = (site) => {
//     setFormData((prev) => ({
//       ...prev,
//       site,
//       entryType: "",
//       locationName: "",
//       image: null,
//     }));
//     setCapturedImage(null);
//     setNearbyOffices([]);
//     setIsSiteDropdownOpen(false);
//     if (formData.email) fetchAttendanceStatus(formData.email);
//   };

//   const handleSiteSearch = (e) => {
//     const val = e.target.value;
//     setFormData((prev) => ({ ...prev, site: val }));
//     const uniqueSites = [...new Set(userData.map(u => u.site).filter(s => s && s !== "N/A"))];
//     const filtered = uniqueSites.filter(s => s.toLowerCase().includes(val.toLowerCase()));
//     setFilteredSites(filtered);
//     setIsSiteDropdownOpen(true);
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3;
//     const φ1 = (lat1 * Math.PI) / 180;
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const handleGetNearbyOffices = () => {
//     setLocationLoading(true);

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userLat = position.coords.latitude;
//           const userLng = position.coords.longitude;

//           const nearby = offices.filter(o => calculateDistance(userLat, userLng, o.lat, o.lng) <= 300);
//           setNearbyOffices(nearby);

//           if (nearby.length > 0) {
//             const names = nearby.map(o => o.name).join(", ");
//             setFormData(prev => ({ ...prev, locationName: names }));
//           } else {
//             const coordinates = `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`;
//             setFormData(prev => ({ ...prev, locationName: coordinates }));
//           }
//           setLocationLoading(false);
//         },
//         (error) => {
//           setErrorMessage("Unable to fetch location. Please enable geolocation.");
//           setFormData(prev => ({ ...prev, locationName: "Location access denied" }));
//           setLocationLoading(false);
//         }
//       );
//     } else {
//       setErrorMessage("Geolocation not supported.");
//       setFormData(prev => ({ ...prev, locationName: "Geolocation not supported" }));
//       setLocationLoading(false);
//     }
//   };

//   const startCamera = async () => {
//     setIsCameraOpen(true);
//     setCapturedImage(null);
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       }
//     } catch (err) {
//       setErrorMessage("Camera access denied.");
//       setIsCameraOpen(false);
//     }
//   };

//   const takePhoto = () => {
//     if (canvasRef.current && videoRef.current) {
//       const context = canvasRef.current.getContext("2d");
//       context.drawImage(videoRef.current, 0, 0, 640, 480);
//       canvasRef.current.toBlob((blob) => {
//         setFormData(prev => ({ ...prev, image: blob }));
//         setCapturedImage(URL.createObjectURL(blob));
//         stopCamera();
//       }, "image/jpeg");
//     }
//   };

//   const stopCamera = () => {
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach(t => t.stop());
//     }
//     setIsCameraOpen(false);
//   };

//   const toBase64 = (blob) => new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     setErrorMessage("");

//     const required = ["email", "name", "empCode", "site", "entryType", "workShift", "locationName", "image"];
//     const missing = required.filter(k => !formData[k]);
//     if (missing.length > 0) {
//       setErrorMessage("Please fill all required fields.");
//       setIsSubmitting(false);
//       return;
//     }

//     const user = userData.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
//     if (!user || user.name !== formData.name || user.empCode !== formData.empCode) {
//       setErrorMessage("Invalid user details.");
//       setIsSubmitting(false);
//       return;
//     }

//     const storedEmail = localStorage.getItem('userEmail');
//     if (storedEmail && storedEmail.toLowerCase() !== formData.email.toLowerCase()) {
//       setErrorMessage("Use the same email as earlier today.");
//       setIsSubmitting(false);
//       return;
//     }

//     await fetchAttendanceStatus(formData.email);

//     if (isSpecificRCC) {
//       if (formData.entryType === "Out" && !attendanceStatus.hasCheckedIn) {
//         setErrorMessage("You must Check In before Checking Out.");
//         setIsSubmitting(false);
//         return;
//       }
//       if (formData.entryType === "In" && attendanceStatus.hasCheckedIn) {
//         setErrorMessage("Already checked in today.");
//         setIsSubmitting(false);
//         return;
//       }
//       if (formData.entryType === "Out" && attendanceStatus.hasCheckedOut) {
//         setErrorMessage("Already checked out today.");
//         setIsSubmitting(false);
//         return;
//       }
//     }

//     try {
//       const imageBase64 = await toBase64(formData.image);
//       const payload = { ...formData, image: imageBase64 };

//       const res = await fetch("https://sales-attendance-leave.vercel.app/api/attendance-Form", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (res.ok && data.result === "success") {
//         setSuccessMessage(`Attendance ${formData.entryType === "In" ? "Check In" : "Check Out"} successful!`);
//         setShowSuccess(true);
//         localStorage.setItem('userEmail', formData.email);
//         setTimeout(() => setShowSuccess(false), 3000);

//         setFormData({
//           email: "", name: "", empCode: "", site: "", entryType: "", workShift: "", locationName: "", image: null
//         });
//         setCapturedImage(null);
//         setNearbyOffices([]);
//         setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
//       } else {
//         setErrorMessage(data.error || "Submission failed.");
//       }
//     } catch (err) {
//       setErrorMessage("Network error. Try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-4 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl mx-auto">

//         {/* Success Toast */}
//         {showSuccess && (
//           <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
//             <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400 flex items-center space-x-3 max-w-sm">
//               <CheckCircle className="w-6 h-6 animate-bounce" />
//               <div>
//                 <p className="font-semibold text-sm">Success!</p>
//                 <p className="text-xs opacity-90">{successMessage}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Loading Overlays */}
//         {(isDataLoading || isSubmitting) && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
//             <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 max-w-sm mx-4">
//               <div className="text-center">
//                 <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
//                   <Loader2 className="w-8 h-8 text-white animate-spin" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                   {isDataLoading ? "Loading User Data" : "Submitting Attendance"}
//                 </h3>
//                 <p className="text-gray-600 text-sm">Please wait...</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="text-center mb-8">
//           <img src="vrn8.png" alt="Logo" className="w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 inline-block" />
//           <h1 className="text-3xl font-bold text-white">Attendance Form</h1>
//           <p className="text-white mt-2">Mark your attendance with ease</p>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//           <div className="p-8">
//             {errorMessage && (
//               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
//                 <XCircle className="w-5 h-5 text-red-500" />
//                 <p className="text-red-700 text-sm">{errorMessage}</p>
//               </div>
//             )}

//             <div className="space-y-6">

//               {/* Email */}
//               <div className="space-y-2">
//                 <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                   <Mail className="w-4 h-4 text-indigo-500" />
//                   <span>Email Address <span className="text-red-500">*</span></span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={formData.email}
//                     onChange={handleEmailSearch}
//                     onFocus={() => setIsEmailDropdownOpen(true)}
//                     onBlur={() => setTimeout(() => setIsEmailDropdownOpen(false), 300)}
//                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 pl-11"
//                     placeholder="Type or select email..."
//                     autoComplete="off"
//                   />
//                   <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                   {formData.email && (
//                     <button
//                       onClick={() => {
//                         setFormData(prev => ({ ...prev, email: "", name: "", empCode: "", site: "" }));
//                         setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
//                       }}
//                       className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
//                     >
//                       <XCircle className="w-5 h-5" />
//                     </button>
//                   )}
//                   {isEmailDropdownOpen && filteredEmails.length > 0 && (
//                     <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
//                       {filteredEmails.map(user => (
//                         <div key={user.email} onMouseDown={() => handleEmailSelect(user.email)} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0">
//                           <div className="font-medium">{user.email}</div>
//                           <div className="text-sm text-gray-500">{user.name} - {user.empCode}</div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Name & Emp Code */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                     <User className="w-4 h-4 text-indigo-500" />
//                     <span>Name <span className="text-red-500">*</span></span>
//                   </label>
//                   <input type="text" value={formData.name} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50" />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                     <User className="w-4 h-4 text-indigo-500" />
//                     <span>Emp Code <span className="text-red-500">*</span></span>
//                   </label>
//                   <input type="text" value={formData.empCode} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50" />
//                 </div>
//               </div>

//               {/* Site */}
//               <div className="space-y-2">
//                 <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                   <Building className="w-4 h-4 text-indigo-500" />
//                   <span>Site <span className="text-red-500">*</span></span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={formData.site}
//                     onChange={handleSiteSearch}
//                     onFocus={() => setIsSiteDropdownOpen(true)}
//                     onBlur={() => setTimeout(() => setIsSiteDropdownOpen(false), 300)}
//                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 pl-11"
//                     placeholder="Type to search site..."
//                     autoComplete="off"
//                   />
//                   <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                   {isSiteDropdownOpen && filteredSites.length > 0 && (
//                     <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
//                       {filteredSites.map(site => (
//                         <div key={site} onMouseDown={() => handleSiteSelect(site)} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0">
//                           {site}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Entry Type & Shift */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                     <CheckCircle className="w-4 h-4 text-indigo-500" />
//                     <span>Entry Type <span className="text-red-500">*</span></span>
//                   </label>
//                   {isSpecificRCC && attendanceStatus.hasCheckedIn && attendanceStatus.hasCheckedOut ? (
//                     <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
//                       <CheckCircle className="w-5 h-5 text-green-500" />
//                       <p className="text-green-700 text-sm">Completed both Check In & Out today.</p>
//                     </div>
//                   ) : (
//                     <select name="entryType" value={formData.entryType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
//                       <option value="">-- Select --</option>
//                       {(!isSpecificRCC || !attendanceStatus.hasCheckedIn) && <option value="In">Check In</option>}
//                       {(!isSpecificRCC || (attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut)) && <option value="Out">Check Out</option>}
//                     </select>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                     <Clock className="w-4 h-4 text-indigo-500" />
//                     <span>Work Shift <span className="text-red-500">*</span></span>
//                   </label>
//                   <select name="workShift" value={formData.workShift} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
//                     <option value="">-- Select Shift --</option>
//                     <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM</option>
//                     <option value="09:30 AM - 06:00 PM">09:30 AM - 06:00 PM</option>
//                     <option value="02:00 PM - 06:00 PM">02:00 PM - 06:00 PM</option>
//                     <option value="09:00 PM - 01:00 PM">09:00 PM - 01:00 PM</option>
//                     <option value="08:00 AM - 04:00 PM">08:00 AM - 04:00 PM</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Location */}
//               <div className="space-y-3">
//                 <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                   <MapPin className="w-4 h-4 text-indigo-500" />
//                   <span>Location Name <span className="text-red-500">*</span></span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={formData.locationName}
//                     readOnly
//                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 pl-11"
//                     placeholder="Click button to get location"
//                   />
//                   <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                 </div>
//                 <button
//                   onClick={handleGetNearbyOffices}
//                   disabled={locationLoading}
//                   className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
//                 >
//                   {locationLoading ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       <span>Getting Location...</span>
//                     </>
//                   ) : (
//                     <>
//                       <MapPin className="w-5 h-5" />
//                       <span>Get Nearby Offices</span>
//                     </>
//                   )}
//                 </button>
//               </div>

//               {/* Camera */}
//               <div className="space-y-3">
//                 <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
//                   <Camera className="w-4 h-4 text-indigo-500" />
//                   <span>Capture Image <span className="text-red-500">*</span></span>
//                 </label>
//                 {!isCameraOpen && !capturedImage && (
//                   <button
//                     onClick={startCamera}
//                     className="w-full py-3 bg-green-900 text-white font-semibold rounded-xl flex items-center justify-center space-x-2"
//                   >
//                     <Camera className="w-5 h-5" />
//                     <span>Open Camera</span>
//                   </button>
//                 )}
//                 {isCameraOpen && (
//                   <div className="space-y-3">
//                     <div className="bg-gray-900 rounded-xl overflow-hidden">
//                       <video ref={videoRef} className="w-full h-64 object-cover" playsInline />
//                     </div>
//                     <div className="grid grid-cols-2 gap-3">
//                       <button onClick={takePhoto} className="py-3 bg-blue-400 from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center space-x-2">
//                         <Camera className="w-4 h-4" />
//                         <span>Take Photo</span>
//                       </button>
//                       <button onClick={stopCamera} className="py-3 bg-amber-700 from-red-500 to-rose-600 text-white rounded-xl flex items-center justify-center space-x-2">
//                         <XCircle className="w-4 h-4" />
//                         <span>Cancel</span>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//                 {capturedImage && (
//                   <div className="space-y-3">
//                     <div className="relative">
//                       <img src={capturedImage} alt="Captured" className="w-full h-64 object-cover rounded-xl border-2 border-green-200" />
//                       <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
//                         <CheckCircle className="w-3 h-3" />
//                         <span>Captured</span>
//                       </div>
//                     </div>
//                     <button onClick={startCamera} className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl">
//                       Retake Photo
//                     </button>
//                   </div>
//                 )}
//                 <canvas ref={canvasRef} width="640" height="480" className="hidden" />
//               </div>

//               {/* Submit */}
//               <div className="pt-4">
//                 <button
//                   onClick={handleSubmit}
//                   disabled={isSubmitting}
//                   className={`w-full py-4 font-semibold rounded-xl shadow-lg flex items-center justify-center space-x-2 ${
//                     isSubmitting
//                       ? "bg-indigo-400 text-white"
//                       : "bg-green-500 from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105"
//                   }`}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       <span>Submitting...</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-5 h-5" />
//                       <span>Submit Attendance</span>
//                     </>
//                   )}
//                 </button>
//               </div>

//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-8">
//           <p className="text-gray-500 text-sm">© 2025 Attendance Portal. Secure & Reliable.</p>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fade-in-down {
//           0% { opacity: 0; transform: translate(-50%, -20px); }
//           100% { opacity: 1; transform: translate(-50%, 0); }
//         }
//         .animate-fade-in-down { animation: fade-in-down 0.5s ease-out; }
//       `}</style>
//     </div>
//   );
// }

// export default AttendanceForm;



import { useState, useEffect, useRef } from "react";
import { Camera, MapPin, Clock, User, Mail, Building, CheckCircle, XCircle, Loader2 } from "lucide-react";

function AttendanceForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    empCode: "",
    site: "",
    entryType: "",
    workShift: "",
    locationName: "",
    image: null,
  });

  const [userData, setUserData] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [nearbyOffices, setNearbyOffices] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const offices = [
    { name: "Home", lat: 23.231878, lng: 77.455833 },
    { name: "Office/कार्यालय", lat: 23.19775059819785, lng: 77.41701272524529 },
    { name: "RNTU/आरएनटीयू", lat: 23.130614, lng: 77.565729 },
    { name: "Dubey Ji Site/दुबे जी साइट", lat: 23.124046, lng: 77.497393 },
    { name: "Regional Center West", lat: 37.7749, lng: -122.4208 },
    { name: "Ultimate Heights", lat: 23.185860, lng: -77.426925 },
    { name: "Satellite Office 2", lat: 37.7738, lng: -122.4194 },
    { name: "Admin Building", lat: 37.7752, lng: -122.42 },
    { name: "Tech Hub", lat: 37.7745, lng: -122.4188 },
    { name: "Support Center", lat: 37.78, lng: -122.41 },
  ];

  const isSpecificRCC = formData.site.toLowerCase() === "rcc office/आरसीसी कार्यालय".toLowerCase();

  const fetchAttendanceStatus = async (email) => {
    if (!email || typeof email !== 'string' || !userData.some((user) => user.email && user.email.toLowerCase() === email.toLowerCase())) {
      setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
      return;
    }
    try {
      const now = new Date();
      const istOptions = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
      const yyyyMMddFormatter = new Intl.DateTimeFormat("en-CA", istOptions);
      const [year, month, day] = yyyyMMddFormatter.format(now).split('-');
      const yyyyMMddDate = `${year}-${month}-${day}`;

      let url = `https://sales-attendance-leave.vercel.app/api/attendance?email=${encodeURIComponent(email)}&date=${yyyyMMddDate}`;
      let response = await fetch(url, { cache: 'no-store' });
      let records = [];

      if (!response.ok) {
        const ddMMyyyyFormatter = new Intl.DateTimeFormat("en-IN", istOptions);
        const ddMMyyyyDate = ddMMyyyyFormatter.format(now);
        url = `https://sales-attendance-leave.vercel.app/api/attendance?email=${encodeURIComponent(email)}&date=${ddMMyyyyDate}`;
        response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error("Failed to fetch attendance");
      }

      records = await response.json();

      const hasCheckedIn = records.some((record) =>
        record.EntryType?.trim().toLowerCase() === "in" &&
        record.site?.trim().toLowerCase() === "rcc office/आरसीसी कार्यालय".toLowerCase()
      );
      const hasCheckedOut = records.some((record) =>
        record.EntryType?.trim().toLowerCase() === "out" &&
        record.site?.trim().toLowerCase() === "rcc office/आरसीसी कार्यालय".toLowerCase()
      );

      setAttendanceStatus({ hasCheckedIn, hasCheckedOut });
    } catch (error) {
      console.error("Error fetching attendance status:", error);
      setErrorMessage(`Error fetching attendance status: ${error.message}`);
      setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsDataLoading(true);
        const res = await fetch("https://sales-attendance-leave.vercel.app/api/DropdownUserData", { cache: 'no-store' });
        const apiData = await res.json();
        if (!apiData.success) throw new Error(apiData.error || "Failed to fetch user data");

        const normalizedData = apiData.data.map((row) => ({
          name: row["Names"] || "",
          empCode: row["EMP Code"] || "",
          mobile: row["Mobile No."] || "",
          email: row["Email"] || "",
          site: row["Sites"] || "",
        }));

        const usersWithEmail = normalizedData.filter((user) => user.email && typeof user.email === 'string');
        setUserData(usersWithEmail);
        setFilteredEmails(usersWithEmail);

        const uniqueSites = [...new Set(normalizedData.map((u) => u.site).filter((s) => s && s !== "N/A"))];
        setFilteredSites(uniqueSites);
      } catch (error) {
        setErrorMessage("Failed to load user data. Please try again later.");
      } finally {
        setIsDataLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (formData.email && isSpecificRCC) {
      fetchAttendanceStatus(formData.email);
    } else {
      setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
    }
  }, [formData.email, formData.site]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      entryType: "",
      locationName: "",
      image: null,
    }));
    setCapturedImage(null);
    setNearbyOffices([]);
  }, [formData.email]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEmailSelect = (email) => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail && storedEmail.toLowerCase() !== email.toLowerCase()) {
      setErrorMessage("Another email is already used for today's attendance. Please use the same email.");
      return;
    }
    const user = userData.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        name: user.name,
        empCode: user.empCode,
        site: user.site,
        entryType: "",
        workShift: "",
        locationName: "",
        image: null,
      }));
      setIsEmailDropdownOpen(false);
      setErrorMessage("");
      localStorage.setItem('userEmail', user.email);
      fetchAttendanceStatus(user.email);
    }
  };

  const handleEmailSearch = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, email: val }));
    const filtered = val ? userData.filter(u => u.email.toLowerCase().includes(val.toLowerCase())) : userData;
    setFilteredEmails(filtered);
    setIsEmailDropdownOpen(true);
  };

  const handleSiteSelect = (site) => {
    setFormData((prev) => ({
      ...prev,
      site,
      entryType: "",
      locationName: "",
      image: null,
    }));
    setCapturedImage(null);
    setNearbyOffices([]);
    setIsSiteDropdownOpen(false);
    if (formData.email) fetchAttendanceStatus(formData.email);
  };

  const handleSiteSearch = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, site: val }));
    const uniqueSites = [...new Set(userData.map(u => u.site).filter(s => s && s !== "N/A"))];
    const filtered = uniqueSites.filter(s => s.toLowerCase().includes(val.toLowerCase()));
    setFilteredSites(filtered);
    setIsSiteDropdownOpen(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGetNearbyOffices = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const nearby = offices.filter(o => calculateDistance(userLat, userLng, o.lat, o.lng) <= 300);
          setNearbyOffices(nearby);

          if (nearby.length > 0) {
            const names = nearby.map(o => o.name).join(", ");
            setFormData(prev => ({ ...prev, locationName: names }));
          } else {
            const coordinates = `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`;
            setFormData(prev => ({ ...prev, locationName: coordinates }));
          }
          setLocationLoading(false);
        },
        (error) => {
          setErrorMessage("Unable to fetch location. Please enable geolocation.");
          setFormData(prev => ({ ...prev, locationName: "Location access denied" }));
          setLocationLoading(false);
        }
      );
    } else {
      setErrorMessage("Geolocation not supported.");
      setFormData(prev => ({ ...prev, locationName: "Geolocation not supported" }));
      setLocationLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setErrorMessage("Camera access denied.");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      canvasRef.current.toBlob((blob) => {
        setFormData(prev => ({ ...prev, image: blob }));
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
      }, "image/jpeg");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
  };

  const toBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    const required = ["email", "name", "empCode", "site", "entryType", "workShift", "locationName", "image"];
    const missing = required.filter(k => !formData[k]);
    if (missing.length > 0) {
      setErrorMessage("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    const user = userData.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (!user || user.name !== formData.name || user.empCode !== formData.empCode) {
      setErrorMessage("Invalid user details.");
      setIsSubmitting(false);
      return;
    }

    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail && storedEmail.toLowerCase() !== formData.email.toLowerCase()) {
      setErrorMessage("Use the same email as earlier today.");
      setIsSubmitting(false);
      return;
    }

    await fetchAttendanceStatus(formData.email);

    if (isSpecificRCC) {
      if (formData.entryType === "Out" && !attendanceStatus.hasCheckedIn) {
        setErrorMessage("You must Check In before Checking Out.");
        setIsSubmitting(false);
        return;
      }
      if (formData.entryType === "In" && attendanceStatus.hasCheckedIn) {
        setErrorMessage("Already checked in today.");
        setIsSubmitting(false);
        return;
      }
      if (formData.entryType === "Out" && attendanceStatus.hasCheckedOut) {
        setErrorMessage("Already checked out today.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const imageBase64 = await toBase64(formData.image);
      const payload = { ...formData, image: imageBase64 };

      const res = await fetch("https://sales-attendance-leave.vercel.app/api/attendance-Form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.result === "success") {
        setSuccessMessage(`Attendance ${formData.entryType === "In" ? "Check In" : "Check Out"} successful!`);
        setShowSuccess(true);
        localStorage.setItem('userEmail', formData.email);

        setTimeout(() => setShowSuccess(false), 3000);

        setFormData({
          email: "", name: "", empCode: "", site: "", entryType: "", workShift: "", locationName: "", image: null
        });
        setCapturedImage(null);
        setNearbyOffices([]);
        setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
      } else {
        setErrorMessage(data.error || "Submission failed.");
      }
    } catch (err) {
      setErrorMessage("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* SUCCESS TOAST - काला बैकग्राउंड, सफेद टेक्स्ट */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-start justify-center pt-20 pointer-events-none z-50">
            <div className="bg-black text-white px-8 py-5 rounded-2xl shadow-2xl border border-gray-700 flex items-center space-x-4 max-w-md animate-fade-in-down">
              <CheckCircle className="w-8 h-8 text-green-400 animate-bounce flex-shrink-0" />
              <div>
                <p className="font-bold text-lg">Success!</p>
                <p className="text-sm opacity-90">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlays */}
        {(isDataLoading || isSubmitting) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 max-w-sm mx-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDataLoading ? "Loading User Data" : "Submitting Attendance"}
                </h3>
                <p className="text-gray-600 text-sm">Please wait...</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <img src="vrn8.png" alt="Logo" className="w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 inline-block" />
          <h1 className="text-3xl font-bold text-white">Attendance Form</h1>
          <p className="text-white mt-2">Mark your attendance with ease</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-6">

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>Email Address <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.email}
                    onChange={handleEmailSearch}
                    onFocus={() => setIsEmailDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsEmailDropdownOpen(false), 300)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 pl-11"
                    placeholder="Type or select email..."
                    autoComplete="off"
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  {formData.email && (
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, email: "", name: "", empCode: "", site: "" }));
                        setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
                      }}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                  {isEmailDropdownOpen && filteredEmails.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredEmails.map(user => (
                        <div key={user.email} onMouseDown={() => handleEmailSelect(user.email)} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.name} - {user.empCode}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Emp Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>Name <span className="text-red-500">*</span></span>
                  </label>
                  <input type="text" value={formData.name} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>Emp Code <span className="text-red-500">*</span></span>
                  </label>
                  <input type="text" value={formData.empCode} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50" />
                </div>
              </div>

              {/* Site Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Building className="w-4 h-4 text-indigo-500" />
                  <span>Site <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.site}
                    onChange={handleSiteSearch}
                    onFocus={() => setIsSiteDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsSiteDropdownOpen(false), 300)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 pl-11"
                    placeholder="Type to search site..."
                    autoComplete="off"
                  />
                  <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  {isSiteDropdownOpen && filteredSites.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredSites.map(site => (
                        <div key={site} onMouseDown={() => handleSiteSelect(site)} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0">
                          {site}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Entry Type & Work Shift */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    <span>Entry Type <span className="text-red-500">*</span></span>
                  </label>
                  {isSpecificRCC && attendanceStatus.hasCheckedIn && attendanceStatus.hasCheckedOut ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-green-700 text-sm">Completed both Check In & Out today.</p>
                    </div>
                  ) : (
                    <select name="entryType" value={formData.entryType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select --</option>
                      {(!isSpecificRCC || !attendanceStatus.hasCheckedIn) && <option value="In">Check In</option>}
                      {(!isSpecificRCC || (attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut)) && <option value="Out">Check Out</option>}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Work Shift <span className="text-red-500">*</span></span>
                  </label>
                  <select name="workShift" value={formData.workShift} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                    <option value="">-- Select Shift --</option>
                    <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM</option>
                    <option value="09:30 AM - 06:00 PM">09:30 AM - 06:00 PM</option>
                    <option value="02:00 PM - 06:00 PM">02:00 PM - 06:00 PM</option>
                    <option value="09:00 PM - 01:00 PM">09:00 PM - 01:00 PM</option>
                    <option value="08:00 AM - 04:00 PM">08:00 AM - 04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>Location Name <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.locationName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 pl-11"
                    placeholder="Click button to get location"
                  />
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <button
                  onClick={handleGetNearbyOffices}
                  disabled={locationLoading}
                  className="w-full py-3 bg-gray-800 from-emerald-500 to-teal-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Get Nearby Offices</span>
                    </>
                  )}
                </button>
              </div>

              {/* Camera Section */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Capture Image <span className="text-red-500">*</span></span>
                </label>
                {!isCameraOpen && !capturedImage && (
                  <button
                    onClick={startCamera}
                    className="w-full py-3 bg-blue-600  text-white font-semibold rounded-xl flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Open Camera</span>
                  </button>
                )}
                {isCameraOpen && (
                  <div className="space-y-3">
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                      <video ref={videoRef} className="w-full h-64 object-cover" playsInline />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={takePhoto} className="py-3 bg-green-900 text-white rounded-xl flex items-center justify-center space-x-2">
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                      </button>
                      <button onClick={stopCamera} className="py-3 bg-blue-900 text-white rounded-xl flex items-center justify-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}
                {capturedImage && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img src={capturedImage} alt="Captured" className="w-full h-64 object-cover rounded-xl border-2 border-green-200" />
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Captured</span>
                      </div>
                    </div>
                    <button onClick={startCamera} className="w-full py-2 bg-blue-700 text-gray-700 rounded-xl">
                      Retake Photo
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} width="640" height="480" className="hidden" />
              </div>

              {/* Submit Button */}
               <div className="pt-4">
                 <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-4 font-semibold rounded-xl shadow-lg flex items-center justify-center space-x-2 ${
                    isSubmitting
                      ? "bg-indigo-400 text-white"
                      : "bg-green-500 from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Attendance</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">© 2025 Attendance Portal. Secure & Reliable.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out; }
      `}</style>
    </div>
  );
}

export default AttendanceForm;