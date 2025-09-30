import React, { useState, useEffect } from "react";
import api from "../api/config";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getUserDetails, updateUserProfile } from "../actions/userActions";
import { USER_UPDATE_PROFILE_RESET } from "../constants/userConstants";
import { locationData } from "../locationData.js";

const ProfileScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success: successUpdateProfile } = userUpdateProfile;

  const availableDistrict = locationData.cities.find((c) => c.name === city);

  // check if user isn't logged in, if not redirect him to login page
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      // check for the user
      if (!user || !user.name || successUpdateProfile) {
        // in case of name profile update
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        // hit /api/users/profile in userActions
        dispatch(getUserDetails("profile"));
      } else {
        // prefill user data on profile page
        setName(user.name);
        setEmail(user.email);
        setImage(user.image);
        setCity(user.city);
        setDistrict(user.district);
      }
    }
  }, [navigate, userInfo, dispatch, user, successUpdateProfile]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true); // loading

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await api.post("/api/upload", formData, config);

      setImage(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
    } else {
      dispatch(
        updateUserProfile({
          id: user._id,
          name,
          email,
          image,
          city,
          district,
          password,
        })
      );
      alert("Profile Updated");
      window.scrollTo(0, 0);
    }
  };

  return (
    <FormContainer>
      <h1>Your Profile</h1>

      {message && <Message variant="danger">{message}</Message>}
      {/* {successUpdateProfile && <Message variant='success'>Profile Updated</Message>} */}

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="image">
            <Form.Label>Profile Picture</Form.Label>

            {/* Current profile picture preview with delete button */}
            {image && (
              <div className="position-relative d-inline-block">
                <Image
                  src={`${process.env.REACT_APP_API_URL}${image}`}
                  rounded
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
                {/* Delete button - small grey circle with cross */}
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setImage("")}
                  className="position-absolute rounded-circle"
                  style={{
                    bottom: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    border: "1px solid #dee2e6",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  title="Remove profile picture"
                >
                  <i
                    className="fas fa-times"
                    style={{ fontSize: "12px", color: "#6c757d" }}
                  ></i>
                </Button>
              </div>
            )}

            {/* File upload for changing picture */}
            <Form.Control
              type="file"
              onChange={uploadFileHandler}
              className="mt-3"
            />
            {uploading && <Loader />}
          </Form.Group>

          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="confirmPassword">
            <Form.Label>ConfirmPassword</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="location">
            <Form.Label>Location</Form.Label>

            <Form.Select value={city} onChange={(e) => setCity(e.target.value)}>
              <option>Select City</option>
              {(locationData.cities || []).map((data, key) => {
                return (
                  <option value={data.name} key={key}>
                    {data.name}
                  </option>
                );
              })}
            </Form.Select>

            <Form.Select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option>Select District</option>
              {availableDistrict?.district.map((data, key) => {
                return (
                  <option value={data.name} key={key}>
                    {data}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>

          <Button type="submit" className="btn-custom-submit">
            Update
          </Button>
        </Form>
      )}
    </FormContainer>
  );
};

export default ProfileScreen;
