import React, { useState } from 'react';

interface ProfileCardProps {
  username?: string;
  onClose: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username: initialUsername = 'PUNN', onClose }) => {
  const [username, setUsername] = useState(initialUsername);

  return (
    // Overlay (พื้นหลังมืด)
    <div style={styles.overlay} onClick={onClose}>
      {/* Import Font แนว Pixel */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}
      </style>

      {/* ตัวการ์ดสีชมพู */}
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        
        {/* ส่วน Header: Profile และ ปุ่มปิด */}
        <div style={styles.header}>
          <h2 style={styles.title}>PROFILE</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* ส่วนรูป Profile */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarCircle}>
            {/* ใส่รูป Avatar ตรงนี้ (ใช้รูป placeholder แทน) */}
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Punn&hair=long&clothing=graphicShirt&clothingColor=blue02&skin=light" 
              alt="Avatar" 
              style={styles.avatarImg} 
            />
          </div>
          {/* ไอคอนกล้องถ่ายรูป */}
          <div style={styles.cameraIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F08080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
        </div>

        {/* ส่วนฟอร์ม Input */}
        <div style={styles.formGroup}>
          <label style={styles.label}>USERNAME</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* ปุ่ม Save */}
        <button style={styles.saveButton}>SAVE</button>

      </div>
    </div>
  );
};

// --- Styles (CSS) ---
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#F28B82', // สีชมพู Coral/Salmon
    padding: '20px',
    borderRadius: '20px',
    width: '300px',
    position: 'relative' as const,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative' as const,
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    color: '#2C1B18',
    letterSpacing: '2px',
  },
  closeButton: {
    position: 'absolute' as const,
    right: '0',
    top: '0',
    background: 'none',
    border: '2px solid #2C1B18',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#2C1B18',
    padding: 0,
  },
  avatarSection: {
    position: 'relative' as const,
    marginBottom: '20px',
  },
  avatarCircle: {
    width: '120px',
    height: '120px',
    backgroundColor: '#FAD556', // สีเหลืองพื้นหลังรูป
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '80%',
    height: 'auto',
    objectFit: 'cover' as const,
  },
  cameraIcon: {
    position: 'absolute' as const,
    bottom: '5px',
    right: '5px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #1a1a1a',
    cursor: 'pointer',
  },
  formGroup: {
    width: '100%',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#2C1B18',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#FFF5E6', // สีครีมของช่อง input
    fontFamily: '"Press Start 2P", cursive',
    fontSize: '14px',
    color: '#666',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  saveButton: {
    backgroundColor: '#EBCFB6', // สีเบจของปุ่ม
    border: 'none',
    padding: '12px 30px',
    borderRadius: '15px',
    fontFamily: '"Press Start 2P", cursive',
    fontSize: '14px',
    color: '#2C1B18',
    cursor: 'pointer',
    boxShadow: '0 2px 0 rgba(0,0,0,0.1)',
  }
};

export default ProfileCard;
