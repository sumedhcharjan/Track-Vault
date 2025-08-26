"use client"
import { Button } from "@/components/ui/button"
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs"
import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Input } from "@/components/ui/input"

export default function Dashboard() {
    const { user } = useKindeAuth();
    const [file, setFile] = useState();

    const handleFileSubmit = async () => {
        console.log(user);
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        if(!user?.id){
            alert("login first");
        }



        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("user_id", user.id);
            formData.append("file_name",file.name)

            const res = await api.post("/file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("File upload success:", res.data);
        } catch (err) {
            console.error("File upload error:", err.response?.data || err.message);
        }
    };

useEffect(() => {
    api.post("/register")
        .then((res) => {
            console.log("Register response:", res.data);
        })
        .catch((err) => {
            console.error("Error:", err.response?.data || err.message);
        });
}, [user]);
return (

    <main>
        <Input type="file" onChange={(e) => setFile(e.target.files[0])} placeholder="add your file" />
        <Button onClick={handleFileSubmit} > add file</Button>
    </main>

)
}