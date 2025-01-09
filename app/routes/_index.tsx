import {
  json,
  redirect,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  const shoppingList = await prisma.shop.findMany();
  return json({ shoppingList });
};

export const action: ActionFunction = async () => {
  const shopListId = uuidv4();
  return redirect(`/shoplist/${shopListId}`);
};

export default function Index() {
  return (
    <div>
      <Form method="post">
        <button type="submit">New</button>
      </Form>
    </div>
  );
}
