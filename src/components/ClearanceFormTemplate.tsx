import React from 'react';
import { ClearanceRequest } from '@/types';

interface ClearanceFormTemplateProps {
  user: {
    name: string;
    email: string;
    registrationNumber: string;
    program?: string;
    nationality?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    startYear?: string;
    endYear?: string;
  };
  request: ClearanceRequest;
  photoUrl?: string; // Optional student photo
}

const fieldStyle: React.CSSProperties = {
  borderBottom: '1px solid #333',
  minHeight: '22px',
  display: 'inline-block',
  width: '100%',
  fontSize: '11px',
  color: '#111',
  paddingBottom: '2px',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '11px',
  color: '#111',
  whiteSpace: 'nowrap',
};

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '11px',
  marginBottom: '2px',
  marginTop: '2px',
  color: '#111',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  alignItems: 'flex-end',
  marginBottom: '4px',
};

const signatureRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '2px',
  alignItems: 'flex-end',
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid #aaa',
  margin: '6px 0 4px 0',
};

interface DeptSectionProps {
  title: string;
  clearance?: {
    status: string;
    staffName?: string;
    staffSignature?: string;
    comment?: string;
    processedAt?: string;
    timestamp?: string | Date;
  };
}

const DeptSection: React.FC<DeptSectionProps> = ({ title, clearance }) => {
  const dateValue = clearance?.processedAt || clearance?.timestamp;
  const date = dateValue
    ? new Date(dateValue).toLocaleDateString('en-GB')
    : '';

  return (
    <div style={{ marginBottom: '2px' }}>
      <div style={sectionTitleStyle}>{title}</div>
      <div style={rowStyle}>
        <span style={labelStyle}>Comment</span>
        <span style={{ ...fieldStyle, flex: 1 }}>
          {clearance?.status === 'approved'
            ? clearance?.comment || 'Cleared'
            : clearance?.status === 'rejected'
            ? clearance?.comment || 'Not cleared'
            : ''}
        </span>
      </div>
      <div style={signatureRowStyle}>
        <div style={{ flex: 1.5 }}>
          <span style={labelStyle}>Signature</span>
          <div style={{ ...fieldStyle, display: 'block', marginTop: '2px', position: 'relative', height: '30px' }}>
            {clearance?.staffSignature && (
              <img 
                src={clearance.staffSignature} 
                alt="Staff Signature" 
                style={{ 
                  height: '100%', 
                  position: 'absolute', 
                  bottom: '2px', 
                  left: '0', 
                  objectFit: 'contain' 
                }} 
              />
            )}
          </div>
        </div>
        <div style={{ flex: 1.5 }}>
          <span style={labelStyle}>Name</span>
          <span style={{ ...fieldStyle, display: 'block', marginTop: '2px' }}>
            {clearance?.staffName || ''}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={labelStyle}>Date</span>
          <span style={{ ...fieldStyle, display: 'block', marginTop: '2px' }}>{date}</span>
        </div>
      </div>
    </div>
  );
};

const ClearanceFormTemplate = React.forwardRef<HTMLDivElement, ClearanceFormTemplateProps>(
  ({ user, request, photoUrl }, ref) => {
    const depts = request.departmentClearances;
    const submittedDate = request.submittedAt
      ? new Date(request.submittedAt).toLocaleDateString('en-GB')
      : '';

    // Generate dynamic document reference number
    const documentRef = `REF/IUK/${user.registrationNumber}/${new Date().getFullYear()}`;

    // Function to get school/department based on program
    const getSchoolFromProgram = (program?: string) => {
      if (!program) return '';
      
      const mapping: Record<string, string> = {
        'Bachelor of Arts in Islamic Sharia': 'School of Sharia & Islamic Studies',
        'Bachelor of Arts in Arabic Language': 'School of Sharia & Islamic Studies',
        'Diploma in Islamic Banking and Finance': 'School of Sharia & Islamic Studies',
        'Diploma in Islamic Psychology': 'School of Sharia & Islamic Studies',
        'Diploma in Arabic Language and Islamic Studies': 'School of Sharia & Islamic Studies',
        'Certificate in Islamic Banking and Finance': 'School of Sharia & Islamic Studies',
        'Certificate in Arabic Language and Islamic Studies': 'School of Sharia & Islamic Studies',
        'Bachelor of Business Management': 'School of Business Management',
        'Diploma in Business Management': 'School of Business Management',
        'Certificate in Business Management': 'School of Business Management',
        'Bachelor of Education (B.Ed)': 'School of Education',
        'Bachelor of Information Technology': 'School of Informatics & Technology',
        'Diploma in Business Information Technology': 'School of Informatics & Technology',
        'Computer Science': 'School of Informatics & Technology' // Fallback for existing data
      };
      
      return mapping[program] || '';
    };

    const schoolName = getSchoolFromProgram(user.program);

    return (
      <div
        ref={ref}
        style={{
          width: '794px',         // A4 at 96dpi
          height: '1123px',       // Force A4 height
          backgroundColor: '#ffffff',
          padding: '16px 36px',   // Further reduced padding
          boxSizing: 'border-box',
          fontFamily: 'Arial, sans-serif',
          color: '#111',
          position: 'relative',
          overflow: 'hidden',     // Ensure it stays on one page
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '12px', position: 'relative' }}>
          {/* Logo at the very top center */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative' }}>
            <img
              src="/iuk_logo.png"
              alt="IUK Logo"
              crossOrigin="anonymous"
              style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 0 8px 0' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Document Reference Number to the right */}
            <div 
              style={{ 
                position: 'absolute', 
                right: '0', 
                top: '0', 
                fontSize: '9px', 
                color: '#444', 
                fontWeight: 400 
              }}
            >
              Doc Ref: {documentRef}
            </div>
          </div>

          <div style={{ fontWeight: 900, fontSize: '12px', marginTop: '2px' }}>
            ISLAMIC UNIVERSITY OF KENYA
          </div>
          <div style={{ fontSize: '10px', marginTop: '1px' }}>
            PO.BOX 884-0024, Kitengela, Kenya
          </div>
          <div style={{ fontSize: '10px' }}>
            Email:{' '}
            <span style={{ color: '#1565c0' }}>
              info@iuk.ac.ke / admission@iuk.ac.ke
            </span>
          </div>
          <div style={{ fontSize: '10px' }}>
            Phone: +254 716 333 222 / +254 707 267 957
          </div>

          <div
            style={{
              color: '#2e7d32',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            GRADUATING STUDENT CLEARANCE FORM
          </div>
        </div>

        {/* ── STUDENT DETAILS + PHOTO ── */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '6px' }}>
          {/* Left column */}
          <div style={{ flex: 1 }}>
            <div style={sectionTitleStyle}>STUDENT DETAILS</div>

            {[
              { label: 'Full Name:', value: user.name },
              { label: 'Adm NO:', value: user.registrationNumber },
              { label: 'Nationality:', value: user.nationality || '' },
              { label: 'Gender:', value: user.gender || '' },
              { label: 'Email:', value: user.email },
              { label: 'Phone:', value: user.phoneNumber || '' },
              { label: 'Address:', value: user.address || '' },
            ].map(({ label, value }) => (
              <div key={label} style={{ ...rowStyle, marginBottom: '2px' }}>
                <span style={{ ...labelStyle, minWidth: '90px' }}>{label}</span>
                <span style={{ ...fieldStyle, flex: 1 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Photo box */}
          <div
            style={{
              width: '90px',
              height: '110px',
              border: '1px solid #2e7d32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '10px',
              fontSize: '9px',
              color: '#888',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student Photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <>
                Add your
                <br />
                Photo
              </>
            )}
          </div>
        </div>

        {/* ── ACADEMIC INFO ── */}
        <div style={{ marginBottom: '4px' }}>
          <div style={sectionTitleStyle}>STUDENT ACADEMIC INFORMATION:</div>
          <div style={{ display: 'flex', gap: '30px' }}>
            {/* Left Column: Years */}
            <div style={{ flex: 1 }}>
              {[
                { label: 'Year Started:', value: user.startYear || '' },
                { label: 'Year Ending:', value: user.endYear || '' },
              ].map(({ label, value }) => (
                <div key={label} style={{ ...rowStyle, marginBottom: '2px' }}>
                  <span style={{ ...labelStyle, minWidth: '80px' }}>{label}</span>
                  <span style={{ ...fieldStyle, flex: 1 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Right Column: Dept/Prog */}
            <div style={{ flex: 2 }}>
              {[
                { label: 'Name Of Department:', value: schoolName },
                { label: 'Name Of Programme:', value: user.program || '' },
              ].map(({ label, value }) => (
                <div key={label} style={{ ...rowStyle, marginBottom: '2px' }}>
                  <span style={{ ...labelStyle, minWidth: '130px' }}>{label}</span>
                  <span style={{ ...fieldStyle, flex: 1 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Removed dividerStyle line as per request */}

        {/* ── DEPARTMENT SECTIONS ── */}
        <DeptSection
          title="Head of Department"
          clearance={depts?.department}
        />
        <DeptSection
          title="Finance"
          clearance={depts?.finance}
        />
        <DeptSection
          title="Dean of Students"
          clearance={depts?.dean}
        />
        <DeptSection
          title="Librarian"
          clearance={depts?.library}
        />
        <DeptSection
          title="Accommodation/Matron"
          clearance={depts?.accommodation}
        />
        <DeptSection
          title="Registrar"
          clearance={depts?.registrar}
        />

        {/* ── FOOTER ── */}
        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '9px',
            color: '#888',
            borderTop: '1px solid #ccc',
            paddingTop: '6px',
          }}
        >
          Generated on {new Date().toLocaleDateString('en-GB')} &nbsp;|&nbsp; IUK
          Graduation Clearance System &nbsp;|&nbsp; Document Reference:{' '}
          {user.registrationNumber}-{submittedDate}
        </div>
      </div>
    );
  }
);

ClearanceFormTemplate.displayName = 'ClearanceFormTemplate';
export default ClearanceFormTemplate;