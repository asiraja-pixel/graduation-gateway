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
  };
  request: ClearanceRequest;
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
  fontSize: '12px',
  textDecoration: 'underline',
  marginBottom: '8px',
  marginTop: '12px',
  color: '#111',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  alignItems: 'flex-end',
  marginBottom: '8px',
};

const signatureRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '6px',
  alignItems: 'flex-end',
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid #aaa',
  margin: '10px 0 8px 0',
};

interface DeptSectionProps {
  title: string;
  clearance?: {
    status: string;
    staffName?: string;
    comment?: string;
    processedAt?: string;
  };
}

const DeptSection: React.FC<DeptSectionProps> = ({ title, clearance }) => {
  const date = clearance?.processedAt
    ? new Date(clearance.processedAt).toLocaleDateString('en-GB')
    : '';

  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={sectionTitleStyle}>{title}</div>
      <div style={rowStyle}>
        <span style={labelStyle}>(Comment)</span>
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
          <span style={{ ...fieldStyle, display: 'block', marginTop: '2px' }}></span>
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
      <div style={dividerStyle} />
    </div>
  );
};

const ClearanceFormTemplate = React.forwardRef<HTMLDivElement, ClearanceFormTemplateProps>(
  ({ user, request }, ref) => {
    const depts = request.departmentClearances as any;
    const submittedDate = request.submittedAt
      ? new Date(request.submittedAt).toLocaleDateString('en-GB')
      : '';

    return (
      <div
        ref={ref}
        style={{
          width: '794px',         // A4 at 96dpi
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          padding: '48px 56px',
          boxSizing: 'border-box',
          fontFamily: 'Arial, sans-serif',
          color: '#111',
          position: 'relative',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div
            style={{
              color: '#2e7d32',
              fontWeight: 900,
              fontSize: '15px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            GRADUATING STUDENT CLEARANCE REPORT
          </div>

          {/* Logo placeholder – swap src to /iuk_logo.png in production */}
          <img
            src="/iuk_logo.png"
            alt="IUK Logo"
            crossOrigin="anonymous"
            style={{ width: '72px', height: '72px', objectFit: 'contain', margin: '4px 0' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />

          <div style={{ fontWeight: 900, fontSize: '13px', marginTop: '4px' }}>
            ISLAMIC UNIVERSITY OF KENYA
          </div>
          <div style={{ fontSize: '11px', marginTop: '2px' }}>
            PO.BOX 884-0024, Kitengela, Kenya
          </div>
          <div style={{ fontSize: '11px' }}>
            Email:{' '}
            <span style={{ color: '#1565c0' }}>
              info@iuk.ac.ke / admission@iuk.ac.ke
            </span>
          </div>
          <div style={{ fontSize: '11px' }}>
            Phone: +254 716 333 222 / +254 707 267 957
          </div>
        </div>

        {/* ── STUDENT DETAILS + PHOTO ── */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
          {/* Left column */}
          <div style={{ flex: 1 }}>
            <div style={sectionTitleStyle}>STUDENT DETAILS</div>

            {[
              { label: 'Full Name:', value: user.name },
              { label: 'Adm NO:', value: user.registrationNumber },
              { label: 'Nationality:', value: user.nationality || '' },
              { label: 'Gender:', value: user.gender || '' },
              { label: 'Email:', value: user.email },
              { label: 'Phone:', value: '' },
              { label: 'Address:', value: '' },
            ].map(({ label, value }) => (
              <div key={label} style={{ ...rowStyle, marginBottom: '6px' }}>
                <span style={{ ...labelStyle, minWidth: '90px' }}>{label}</span>
                <span style={{ ...fieldStyle, flex: 1 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Photo box */}
          <div
            style={{
              width: '100px',
              height: '120px',
              border: '1.5px solid #2e7d32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '18px',
              fontSize: '10px',
              color: '#888',
              textAlign: 'center',
            }}
          >
            Add your
            <br />
            Photo
          </div>
        </div>

        {/* ── ACADEMIC INFO ── */}
        <div style={{ marginBottom: '8px' }}>
          <div style={sectionTitleStyle}>STUDENT ACADEMIC INFORMATION:</div>
          {[
            { label: 'Name Of Department:', value: '' },
            { label: 'Name Of Programme:', value: user.program || '' },
            { label: 'Year Started:', value: '' },
            { label: 'Year Ending:', value: '' },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...rowStyle, marginBottom: '6px' }}>
              <span style={{ ...labelStyle, minWidth: '140px' }}>{label}</span>
              <span style={{ ...fieldStyle, flex: 1 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={dividerStyle} />

        {/* ── DEPARTMENT SECTIONS ── */}
        <DeptSection
          title="Head of Department Report"
          clearance={depts?.academic}
        />
        <DeptSection
          title="Finance Report"
          clearance={depts?.finance}
        />
        <DeptSection
          title="Academic Report"
          clearance={depts?.academic}
        />
        <DeptSection
          title="Librarian Report"
          clearance={depts?.library}
        />
        <DeptSection
          title="Accommodation Matron / Patron Report"
          clearance={depts?.accommodation}
        />
        <DeptSection
          title="Registrar Report"
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