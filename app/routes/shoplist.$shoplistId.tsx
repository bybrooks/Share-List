import {
  json,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "@/utils/db.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShoppingList {
  id: string;
  sessionId: string;
  name: string;
  number: number;
}

export const loader: LoaderFunction = async ({ params }) => {
  const shopListId = params.shoplistId;
  const shoppingLists = await prisma.shop.findMany({
    where: {
      sessionId: shopListId,
    },
  });
  return json({ shoppingLists });
};

export const action: ActionFunction = async ({ request }) => {
  // Retrieve the session ID from the path parameters
  const url = new URL(request.url);
  const shopListId = url.pathname.split("/")[2] || "";

  // Retrieve the submitted data
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === "create") {
    // Model the data to be registered
    const newList: ShoppingList = {
      id: Date.now().toString(),
      sessionId: shopListId,
      name: values.userInput as string,
      number: 1,
    };
    // Register item in the DB
    await prisma.shop.create({
      data: {
        id: newList.id,
        sessionId: newList.sessionId,
        name: newList.name,
        number: 1,
      },
    });
  } else if (_action === "delete") {
    // Delete item from the DB
    await prisma.shop.delete({
      where: {
        id: values.id?.toString(),
      },
    });
  }

  return json({ success: true });
};

export default function Index() {
  const { shoppingLists } = useLoaderData<{ shoppingLists: ShoppingList[] }>();
  const [newListName, setNewListName] = useState("");
  const submit = useSubmit();

  const handleDelete = (id: string) => {
    submit({ _action: "delete", id }, { method: "post", replace: true });
  };

  const handleCreate = (userInput: string) => {
    setNewListName("");
    submit({ _action: "create", userInput }, { method: "post", replace: true });
  };

  return (
    <div>
      <div className="flex p-4">
        <Input
          type="text"
          name="name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter new list name"
          required
        />
        <Button onClick={() => handleCreate(newListName)}>Add List</Button>
      </div>

      <ul className="space-y-4 p-4">
        {shoppingLists.map((list) => (
          <li
            key={list.id}
            className="flex items-center justify-between rounded-md bg-white p-4 shadow"
          >
            <span>{list.name}</span>
            <Button
              onClick={() => handleDelete(list.id)}
              className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
