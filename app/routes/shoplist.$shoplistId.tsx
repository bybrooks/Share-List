import {
  json,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData, Form, useSubmit } from "@remix-run/react";
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
  const url = new URL(request.url);
  const shopListId = url.pathname.split("/")[2] || "";

  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);
  const newList: ShoppingList = {
    id: Date.now().toString(),
    sessionId: shopListId,
    name: values.name as string,
    number: 1,
  };
  if (_action === "create") {
    await prisma.shop.create({
      data: {
        id: newList.id,
        sessionId: newList.sessionId,
        name: newList.name,
        number: 1,
      },
    });
  } else if (_action === "delete") {
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(event.currentTarget, { replace: true });
    setNewListName("");
  };

  const handleDelete = (id: string) => {
    submit({ _action: "delete", id }, { method: "post", replace: true });
  };

  return (
    <div>
      <Form method="post" onSubmit={handleSubmit} className="mb-8 p-4">
        <div className="flex">
          <Input
            type="text"
            name="name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter new list name"
            required
          />
          <Button>Add List</Button>
        </div>
      </Form>

      <ul className="space-y-4 p-4">
        {shoppingLists.map((list) => (
          <li
            key={list.id}
            className="flex items-center justify-between rounded-md bg-white p-4 shadow"
          >
            <span>{list.name}</span>
            <button
              onClick={() => handleDelete(list.id)}
              className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
