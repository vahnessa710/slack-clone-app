import { useEffect, useRef } from "react";
import "../Primary/Primary.css";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";

function Primary({ primary, setPrimary }) {
  const { currentUser } = useAuth();
  const containerRef = useRef(null);
  // Close `primary` when clicking outside the container
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setPrimary(false); // Close the primary view
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setPrimary]);

  return (
    <>
      {primary && (
        <div
          className={`primary-container ${primary ? "" : "hidden"}`}
          ref={containerRef}
          data-testid="primary"
        >
            <div>
              <div className="id-img-container">
                <FaUserCircle className="id-img" />
              </div>
              <hr />
              <div className="id-phone-email-container">
                <p className="slacking-user-details">Slacking User Details:</p>
                <p className="id-phone-email-container-p">
                  <MdEmail className="email-icon" />
                  {currentUser?.email}
                </p>
                <p className="id-phone-email-container-p">
                  <FaPhoneAlt className="phone-icon" />
                  {currentUser?.id}
                </p>
              </div>
            </div>         
        </div>
      )}
    </>
  );
}

export default Primary;
