import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { VerificationEvidence } from '../../types';

interface TrustBadgeProps {
  label: string;
  evidence: VerificationEvidence;
  code?: string;
  showIcon?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  label,
  evidence,
  code,
  showIcon = true,
}) => {
  const isVerified = evidence === 'Independently Verified';
  const isDocumented = evidence === 'Document Submitted';

  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      {showIcon && (
        isVerified ? (
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
        ) : isDocumented ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
        )
      )}
      <span className="font-medium text-[#172033]">{label}</span>
      {code && (
        <>
          <span className="text-[#94A3B8]" aria-hidden="true">·</span>
          <span className="font-mono text-[#64748B] text-[11px]">{code}</span>
        </>
      )}
      <span className="text-[#94A3B8]" aria-hidden="true">·</span>
      <span
        className={`text-[11px] ${
          isVerified
            ? 'text-[#0F766E] font-medium'
            : isDocumented
            ? 'text-[#64748B]'
            : 'text-[#94A3B8] italic'
        }`}
      >
        {evidence}
      </span>
    </div>
  );
};

export const DemoDataDisclaimer: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1 text-[11px] text-[#64748B]">
      <AlertCircle className="w-3 h-3 text-[#94A3B8]" />
      <span>Synthetic demonstration profile for industrial prototype</span>
    </div>
  );
};
