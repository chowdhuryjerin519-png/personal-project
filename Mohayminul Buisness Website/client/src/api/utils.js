import axios from "axios";

// upload image return image url 
export const imageUpload = async imageDat=>{
        const formData = new FormData();
    formData.append("image", imageDat);

    const { data } = await axios.post(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      formData,
    );
    
      return data.data.display_url
}