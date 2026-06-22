import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AddBlog from "./pages/Blog/AddBlog";
import ManageBlogs from "./pages/Blog/ManageBlogs";
import EditBlog from "./pages/Blog/EditBlog";

import Newsletter from "./pages/Newsletter";
import ManageMedia from "./pages/ManageMedia"; 
import ManageBlogCategories from "./pages/Blog/ManageBlogCategories";
import DashBoardOutlet from "./components/layout/DashBoardOutlet";


const App = () => {
  const { pathname } = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    window.scroll(0, 0)
  }, [pathname])


  return (
    <>
      <Routes>
        <Route path="/" element={<>{"Home Page"}</>} />
        

        <Route element={<DashBoardOutlet />}>
          <Route path="/dashboard" element={<>{"Dashboard Home"}</>} />

          {/* Blogs */}
          <Route path="/dashboard/add-blog" element={<AddBlog />} />
          <Route path="/dashboard/manage-blogs" element={<ManageBlogs />} />
          <Route path="/dashboard/manage-blogs-catgories" element={<ManageBlogCategories />} />
          <Route path="/dashboard/edit-blog/:id" element={<EditBlog />} />



          <Route path="/dashboard/newsletter" element={<Newsletter />} />
          <Route path="/dashboard/manage-media" element={<ManageMedia />} />
        </Route>

      </Routes >

      <ToastContainer limit={3} pauseOnHover />
    </>
  )
}

export default App
