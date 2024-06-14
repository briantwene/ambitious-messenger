import { MdKeyboardArrowLeft, MdMoreVert, MdLocalPhone } from "react-icons/md";
import { GoDotFill, GoDot } from "react-icons/go";
import styles from "./ChatHeader.module.scss";
import { useDispatch } from "react-redux";
import { active } from "../../features/chats/chatSlice";
import { useNavigate } from "react-router-dom";
import { rtcActions } from "../../features/webrtc/rtcSlice";
import { modalOpen } from "../../features/user/userSlice";

function ChatHeader({ profilePic, name, status }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const openCallPanel = (e) => {
    console.log(e);
    dispatch(active());
    dispatch(rtcActions.startCall(name));
  };

  const openModal = () => {
    dispatch(modalOpen());
  };

  const handleNavigateBack = () => {
    navigate("/chats");
  };

  return (
    <header className={styles.header}>
      <button className={`${styles.buttonBack} ${styles.button}`} onClick={handleNavigateBack}>
        <MdKeyboardArrowLeft className={`${styles.buttonIcon} ${styles.buttonIcon__back}`} />
      </button>
      <div className={styles.imgContainer}>
        <img className={styles.imgContainer__img} src={profilePic} alt="" />
      </div>
      <div className={styles.contactInfo}>
        <h4 className={styles.contactInfo__name}>{name}</h4>
        <div className={styles.status}>
          {status ? <GoDotFill className={styles.status__dot} /> : <GoDot className={styles.status__dot} />}
          <span className={styles.status__text}>{status ? "Online" : "Offline"}</span>
        </div>
      </div>
      <button onClick={openCallPanel} className={`${styles.buttonVoice} ${styles.button}`}>
        <MdLocalPhone className={`${styles.buttonIcon} ${styles.buttonIcon__phone}`} />
      </button>
      <button
        // onClick={openModal}
        className={`${styles.buttonOptions} ${styles.button}`}
      >
        <MdMoreVert className={`${styles.buttonIcon} ${styles.buttonIcon__options}`} />
      </button>
    </header>
  );
}

export default ChatHeader;
