import {
  json,
  redirect,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/utils/db.server";
import { Button } from "@/components/ui/button";

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
    <Form method="post">
      <Button variant="outline" size="sm">
        New
      </Button>
    </Form>
  );
}
