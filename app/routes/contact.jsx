import { ContactUs } from "../components/ContactUs";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { json } from "@remix-run/node";
import { getServerFirebase } from "../firebase";

export const meta = () => {
  return [
    { title: "Steele Market | Contact Us" },
    { name: "Contact Us", content: "Contact Us" },
  ];
};

const FormSchema = zfd.formData({
  email: z.string().email(),
  username: z.string().min(1),
  message: z.string().min(1).max(1000),
});

export const action = async ({ request }) => {

  const formData = await request.formData();
  const dataObject = FormSchema.safeParse(formData);

  const errors = !dataObject.success
    ? ((dataObject) => {
        const errorList = {};
        for (let data of dataObject.error.issues) {
          errorList[data.path[0]] = data.message;
        }
        return errorList;
      })(dataObject)
    : null;

  if (errors) return json({ errors: errors }, { status: 400 });

  return json({success: true}, { status: 201 })
};

export default function Contact() {
  return <ContactUs />;
}
