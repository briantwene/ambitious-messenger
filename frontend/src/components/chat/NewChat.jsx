import styles from "./NewChat.module.scss";
import { useState, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { resetNewChat as resetChatState } from "../../features/chats/chatSlice";
import { createChat } from "../../features/chats/chatSlice";
import { reset as resetFriendsState } from "../../features/friends/friendsSlice";
import { getAllFriends } from "../../features/friends/friendsSlice";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Link } from "react-router-dom";

// temporary
import defaultUserPic from "../../assets/default_user_1.png";

function NewChat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newChatStatus: chatStatus, newChatError: chatError, newChatId } = useSelector((state) => state.chats);
  const { status: friendsStatus, error: friendsError, friendsList } = useSelector((state) => state.friends);

  const [searchText, setSearchText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const searchScrollRef = useRef(null);

  useEffect(() => {
    dispatch(getAllFriends());
  }, []);

  useEffect(() => {
    if (chatStatus === "failed") {
      // TODO show error
      console.log(chatError);
    }
    // TODO this will need some additional checks
    if (chatStatus === "succeeded") {
      if (newChatId) {
        console.log("New chat created");
        navigate(`/chats/${newChatId}`);
      } else {
        navigate("/chats");
      }

      return () => {
        dispatch(resetChatState());
        dispatch(resetFriendsState());
      };
    }
  }, [chatStatus, navigate, chatError]);

  useEffect(() => {
    // Scroll to the end when the content changes
    if (searchScrollRef.current) {
      searchScrollRef.current.scrollLeft = searchScrollRef.current.scrollWidth;
    }
  }, [selectedUsers]);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredUsers = friendsList.filter((user) =>
    user.friend.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleUserCheckboxChange = (user) => {
    console.log(user);
    setSelectedUsers((prevSelectedUsers) => {
      const userIndex = prevSelectedUsers.findIndex((prevUser) => prevUser.friend.username === user.friend.username);
      if (userIndex === -1) {
        // User not found, add the user
        console.log("User not found, add the user");
        return [...prevSelectedUsers, user];
      } else {
        // User found, remove the user from the array
        const updatedUsers = [...prevSelectedUsers];
        updatedUsers.splice(userIndex, 1);
        return updatedUsers;
      }
    });
  };

  const handleRemoveUser = (user) => {
    setSelectedUsers((prevSelectedUsers) => {
      const userIndex = prevSelectedUsers.findIndex((prevUser) => prevUser.username === user.username);

      const updatedUsers = [...prevSelectedUsers];
      updatedUsers.splice(userIndex, 1);
      return updatedUsers;
    });
  };

  const handleClearInput = () => {
    setSearchText("");
    setSelectedUsers([]);
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      // TODO show error
      console.log("No users selected");
      return;
    }

    const newChatData = {
      isPrivate: false, // TODO
      members: selectedUsers.map(({ friend }) => friend.username),
    };
    console.log(newChatData);
    dispatch(createChat(newChatData));
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <Link to={"/chats"} className={styles.link}>
          <button className={`${styles.buttonBack} ${styles.button}`}>
            <MdKeyboardArrowLeft className={`${styles.buttonIcon} ${styles.buttonIcon__back}`} />
          </button>
        </Link>
        <div className={styles.leftSideContainer}>
          <div className={styles.headingContainer}>
            <h2 className={styles.heading}>New chat</h2>
          </div>
        </div>
        <div className={styles.buttonsContainer}></div>
      </header>

      <div className={styles.newChat}>
        <div className={styles.searchContainer} ref={searchScrollRef}>
          {selectedUsers.length > 0 &&
            selectedUsers.map((user) => (
              <div key={user.friend.username} className={styles.searchContainer__selectedUser}>
                <span key={user.friend.username} className={styles.searchContainer__username}>
                  {`${user.friend.username}`}
                </span>
                <RxCross2 className={styles.searchContainer__close} onClick={() => handleRemoveUser(user)} />
              </div>
            ))}
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search friends"
            className={styles.searchContainer__input}
          />
          <button className={styles.searchContainer__clear} onClick={handleClearInput}>
            <RxCross2 className={styles.searchContainer__clearButton} />
          </button>
        </div>
        <ul className={styles.userList}>
          {filteredUsers.map((user) => (
            <li
              key={user.friend.username}
              className={styles.userList__item}
              onClick={() => handleUserCheckboxChange(user)}
            >
              <div className={styles.userList__leftContainer}>
                <div className={styles.userList__imageContainer}>
                  <img className={styles.userList__img} src={defaultUserPic} alt={"" /* TODO make this dynamic*/} />
                </div>
                <span className={styles.userList__username}>{user.friend.username}</span>
              </div>
              <input
                type="checkbox"
                key={user.friend.username}
                checked={selectedUsers.some((selectedUser) => selectedUser.friend.username === user.friend.username)}
                onChange={() => {}}
                className={styles.userList__checkbox}
              />
            </li>
          ))}
        </ul>
        <div className={styles.createChat}>
          <button
            className={styles.createChat__button}
            onClick={handleCreateChat}
            disabled={false /* TODO */}
            type="submit"
          >
            Create Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewChat;
