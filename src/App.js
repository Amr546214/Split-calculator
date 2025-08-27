import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

const initialFriends = [
  {
    id: 118836,
    name: "Amr",
    image: "https://avatars.githubusercontent.com/u/157937738?v=4",
    balance: -7,
  },
  {
    id: 933372,
    name: "Okasha",
    image: "https://avatars.githubusercontent.com/u/157937738?v=4",
    balance: 20,
  },
  {
    id: 499476,
    name: "ALi",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  const [friends, setfriends] = useState(() => {
    const stored = localStorage.getItem("friends");
    return stored ? JSON.parse(stored) : initialFriends;
  });

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selceted, setselected] = useState(null);

  useEffect(() => {
    localStorage.setItem("friends", JSON.stringify(friends));
  }, [friends]);

  function handleshowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  function handleAddFriend(friend) {
    setfriends((friends) => [...friends, friend]);
    setShowAddFriend(false);
  }

  function handleselect(friend) {
    setselected((cur) => (cur?.id === friend.id ? null : friend));
    setShowAddFriend(false);
  }

  function handleSplit(value) {
    setfriends((friends) =>
      friends.map((friend) =>
        friend.id === selceted.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );
    setselected(null);
  }

  function handleDelete(friendId) {
    Swal.fire({
      title: "Are you sure?",
      text: "This friend will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setfriends((friends) => friends.filter((f) => f.id !== friendId));
        Swal.fire("Deleted!", "Friend has been removed.", "success");
      }
    });
  }

  return (
    <div className="app">
      <motion.div
        className="sidebar"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Friendlist
          friends={friends}
          onselect={handleselect}
          ondelete={handleDelete}
          selcetedFriend={selceted}
        />

        <AnimatePresence>
          {showAddFriend && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Form onAddfriend={handleAddFriend} />
            </motion.div>
          )}
        </AnimatePresence>

        <Button onClick={handleshowAddFriend}>
          {showAddFriend ? "Close" : "ADD Friend"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {selceted && (
          <motion.div
            key="split-form"
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FormSplittBill Sfriend={selceted} onSplit={handleSplit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Friendlist({ friends, onselect, ondelete, selcetedFriend }) {
  return (
    <ul>
      <AnimatePresence>
        {friends.map((friend) => (
          <motion.li
            key={friend.id}
            className={selcetedFriend?.id === friend.id ? "selected" : ""}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <img src={friend.image} alt={friend.name}></img>
            <h3>{friend.name}</h3>
            {friend.balance < 0 && (
              <p className="red">
                You owe {friend.name} {Math.abs(friend.balance)}€
              </p>
            )}
            {friend.balance > 0 && (
              <p className="green">
                {friend.name} owes you {Math.abs(friend.balance)}€
              </p>
            )}
            {friend.balance === 0 && <p>You and {friend.name} are even</p>}

            <div style={{ display: "flex", gap: "8px" }}>
              <Button onClick={() => onselect(friend)}>
                {selcetedFriend?.id === friend.id ? "close" : "select"}
              </Button>
              <Button onClick={() => ondelete(friend.id)}>❌</Button>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function Form({ onAddfriend }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48?");

  function handlesubmit(e) {
    e.preventDefault();
    if (!name || !image) return;
    const id = Date.now();
    const newfriend = {
      name,
      image: `${image}?=${id}`,
      balance: 0,
      id,
    };
    onAddfriend(newfriend);
    setName("");
    setImage("https://i.pravatar.cc/48?");
  }

  return (
    <motion.form
      className="form-add-friend"
      onSubmit={handlesubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <label>👫 Friend name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <label>🌄 Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      ></input>
      <Button>ADD</Button>
    </motion.form>
  );
}

function FormSplittBill({ Sfriend, onSplit }) {
  const [bill, setBill] = useState("");
  const [paid, setpaid] = useState("");
  const [whopaid, setwhopaid] = useState("user");
  const expense = bill ? bill - paid : "";

  function handleexpense(e) {
    e.preventDefault();
    if (!bill || !paid) return;
    onSplit(whopaid === "user" ? expense : -paid);
    setBill("");
    setpaid("");
    setwhopaid("user");
  }

  return (
    <motion.form
      className="form-split-bill"
      onSubmit={handleexpense}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Split a bill with {Sfriend.name}</h2>

      <label>💰 Bill value</label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(+e.target.value)}
      ></input>

      <label>🧍‍♀️ Your expense</label>
      <input
        type="text"
        value={paid}
        onChange={(e) =>
          setpaid(+e.target.value > bill ? paid : +e.target.value)
        }
      ></input>

      <label>👫 {Sfriend.name}'s expense</label>
      <input type="text" disabled value={expense}></input>

      <label>🤑 Who is paying the bill</label>
      <select value={whopaid} onChange={(e) => setwhopaid(e.target.value)}>
        <option value={Sfriend.name}>{Sfriend.name}</option>
        <option value="user">You</option>
      </select>
      <Button>Split bill</Button>
    </motion.form>
  );
}
