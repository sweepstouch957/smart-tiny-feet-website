import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  Heart,
  Shield,
  Users,
  BookOpen,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Baby,
  Palette,
  Music,
  Gamepad2,
  Menu,
  X,
} from "lucide-react";
import "./App.css";

// Import images
import heroImage from "./assets/hero-children-playing.jpg";
import classroomImage from "./assets/classroom-modern.jpg";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    parentName: "",
    childName: "",
    childAge: "",
    phone: "",
    email: "",
    urgency: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "phone") {
      // Eliminar todo lo que no sea número
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

      // Formatear a XXX-XXX-XXXX
      if (digitsOnly.length <= 3) {
        formattedValue = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        formattedValue = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
      } else {
        formattedValue = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
          3,
          6
        )}-${digitsOnly.slice(6)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!/^[a-zA-Z\s]+$/.test(formData.parentName)) {
      newErrors.parentName = "Only letters are allowed.";
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.childName)) {
      newErrors.childName = "Only letters are allowed.";
    }

    if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be in the format XXX-XXX-XXXX.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("❌ Please correct the errors in the form.");
      return;
    }

    const res = await fetch("https://sheetdb.io/api/v1/6vrzlnfq4hzzv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: formData }),
    });

    if (res.ok) {
      toast.success("✅ Your message has been sent successfully!");
      setFormData({
        parentName: "",
        childName: "",
        childAge: "",
        phone: "",
        email: "",
        urgency: "",
      });
      setErrors({});
    } else {
      toast.error("❌ There was a problem submitting the form.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header/Navigation */}
      <Toaster position="top-right" reverseOrder={false} />
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container max-w-[1240px] mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Smart Tiny Feet Daycare
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="#home"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </a>
              <a
                href="#services"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Services
              </a>
              <a
                href="#programs"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Programs
              </a>
              <a
                href="#facilities"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Facilities
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <a
                  href="#home"
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                >
                  Home
                </a>
                <a
                  href="#services"
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                >
                  Services
                </a>
                <a
                  href="#programs"
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                >
                  Programs
                </a>
                <a
                  href="#facilities"
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                >
                  Facilities
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                >
                  Testimonials
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                >
                  Contact
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 overflow-hidden">
        <div className="container max-w-[1240px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                Quality Childcare
              </Badge>
              <h2 className="text-5xl font-bold text-gray-800 leading-tight">
                Where little smart feet take their first steps
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                At Smart Tiny Feet Daycare, we provide a safe, educational, and
                fun environment where your child can grow, learn, and develop
                their full potential with love and professional care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contact">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    Schedule Tour
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Happy children playing at Smart Tiny Feet Daycare"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <p className="text-sm text-gray-600">
                  Over 200 satisfied families
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container max-w-[1240px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive childcare services designed for your
              child's complete development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Total Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Completely secure facilities with monitoring systems, trained
                  staff, and strict safety protocols.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Early Education</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Educational programs adapted to each age that stimulate
                  cognitive, social, and emotional development.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Personalized Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Individual attention with small groups to ensure each child
                  receives the care they need.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section
        id="programs"
        className="py-20 bg-gradient-to-br from-blue-50 to-green-50"
      >
        <div className="container max-w-[1240px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized programs by age groups for optimal development at each
              stage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Baby className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg">
                  Infants (6 weeks -18 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Sensory stimulation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Motor development
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Feeding routines
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Personalized care
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">
                  Toddlers (18-36 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Language development
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Social skills
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Structured play
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Basic independence
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Palette className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Preschool (3-4 years)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    School preparation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Art and creativity
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Basic math
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Early reading
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Pre-K (4-5 years)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Kindergarten prep
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Academic skills
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Teamwork
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Early leadership
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 bg-white">
        <div className="container max-w-[1240px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Facilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Spaces specially designed for learning, fun, and safe development
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                Modern and Safe Classrooms
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Spacious and Bright Spaces
                    </h4>
                    <p className="text-gray-600">
                      Classrooms designed with abundant natural light and proper
                      ventilation
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Quality Educational Materials
                    </h4>
                    <p className="text-gray-600">
                      Safe toys and materials that stimulate learning
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Rest Areas</h4>
                    <p className="text-gray-600">
                      Comfortable and quiet spaces for naps and relaxation
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src={classroomImage}
                alt="Modern classroom at Smart Tiny Feet Daycare"
                className="rounded-2xl shadow-xl w-full h-auto"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Play Area</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Indoor and outdoor play zone with safe equipment appropriate
                  for each age.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Art Workshop</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Space dedicated to artistic and creative activities with safe
                  and non-toxic materials.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Music className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Music Room</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Special area for musical activities and development of rhythm
                  and coordination.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 bg-gradient-to-br from-blue-50 to-green-50"
      >
        <div className="container max-w-[1240px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What Our Families Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The trust of parents is our greatest achievement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <CardTitle className="text-lg">Maria Gonzalez</CardTitle>
                <CardDescription>Mother of Sofia (3 years old)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "Smart Tiny Feet Daycare has been a blessing for our family.
                  Sofia has developed both her confidence and social skills. The
                  staff is incredibly caring and professional."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <CardTitle className="text-lg">Carlos Rodriguez</CardTitle>
                <CardDescription>Father of Diego (4 years old)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "The preparation Diego received here for kindergarten was
                  exceptional. He arrived at school with confidence and skills
                  that other children were still developing."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <CardTitle className="text-lg">Ana Martinez</CardTitle>
                <CardDescription>Mother of Emma (2 years old)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "I love the constant communication they maintain with me. I
                  receive daily photos and updates of Emma's activities. It's
                  like having a window into her day."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container max-w-[1240px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to take the first step? Contact us to schedule a visit or
              resolve your questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Phone</h4>
                    <p className="text-gray-600">+1 (631) 746-7276</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">
                      smarttinyfeetdaycare@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Address</h4>
                    <p className="text-gray-600">
                      155 Fillmore ave. Deer Park, NY 11729
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 7:30 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form and we will contact you soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        name="parentName"
                        placeholder="Parent or Guardian Name"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.parentName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.parentName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        type="text"
                        name="childName"
                        placeholder="Child's Name"
                        value={formData.childName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.childName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.childName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="childAge"
                        placeholder="Child's Age"
                        value={formData.childAge}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.childAge && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.childAge}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Textarea
                        name="urgency"
                        placeholder="How soon do you need childcare?"
                        value={formData.urgency}
                        onChange={handleInputChange}
                        rows={3}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    >
                      Submit Inquiry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container max-w-[1240px] mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Smart Tiny Feet Daycare</h3>
              </div>
              <p className="text-gray-400">
                Quality childcare where every child can grow, learn, and develop
                their full potential.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#home"
                    className="hover:text-white transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-white transition-colors"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#programs"
                    className="hover:text-white transition-colors"
                  >
                    Programs
                  </a>
                </li>
                <li>
                  <a
                    href="#facilities"
                    className="hover:text-white transition-colors"
                  >
                    Facilities
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Infants (6 weeks - 18 months)</li>
                <li>Toddlers (18-36 months)</li>
                <li>Preschool (3-4 years)</li>
                <li>Pre-K (4-5 years)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+1 (631) 746-7276</li>
                <li>smarttinyfeetdaycare@gmail.com</li>
                <li>155 Fillmore ave. Deer Park, NY 11729</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Smart Tiny Feet Daycare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
