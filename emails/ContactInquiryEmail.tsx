import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import type { ContactInquiry } from "@/lib/contact";
import { PROJECT_TYPE_LABEL } from "@/lib/contact";

const colors = {
  bg: "#050505",
  paper: "#f2f0ea",
  muted: "#a6a6a0",
  line: "rgba(242,240,234,0.16)",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Section style={{ margin: "0 0 28px" }}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value || "—"}</Text>
    </Section>
  );
}

export default function ContactInquiryEmail({ inquiry }: { inquiry: ContactInquiry }) {
  const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    `Re: ${inquiry.name}`
  )}`;

  return (
    <Html>
      <Head />
      <Preview>New project inquiry from {inquiry.name}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={wordmarkStyle}>33 FILMS</Text>
          <Hr style={hrStyle} />
          <Text style={titleStyle}>NEW PROJECT INQUIRY</Text>
          <Text style={taglineStyle}>
            Creative Direction / Film / Visual Experiences
          </Text>

          <Field label="NAME" value={inquiry.name} />
          <Field label="EMAIL" value={inquiry.email} />
          <Field label="COMPANY" value={inquiry.company} />
          <Field
            label="PROJECT TYPE"
            value={PROJECT_TYPE_LABEL[inquiry.projectType]}
          />
          <Field label="DEADLINE" value={inquiry.deadline} />
          <Field label="MESSAGE" value={inquiry.message} />

          <Button href={mailto} style={buttonStyle}>
            REPLY TO {inquiry.name.toUpperCase()}
          </Button>

          <Hr style={{ ...hrStyle, marginTop: "48px" }} />
          <Text style={footerStyle}>33 FILMS</Text>
          <Text style={footerMutedStyle}>
            Creative Direction / Film / Visual Experiences
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: colors.bg,
  margin: 0,
  padding: "32px 0",
  fontFamily:
    'Helvetica Neue, Helvetica, Arial, sans-serif',
};

const containerStyle = {
  backgroundColor: colors.bg,
  margin: "0 auto",
  maxWidth: "560px",
  padding: "48px 32px",
};

const wordmarkStyle = {
  color: colors.paper,
  fontSize: "13px",
  letterSpacing: "0.28em",
  margin: "0 0 32px",
};

const titleStyle = {
  color: colors.paper,
  fontSize: "28px",
  fontWeight: 400,
  letterSpacing: "0.04em",
  lineHeight: "1.2",
  margin: "32px 0 12px",
};

const taglineStyle = {
  color: colors.muted,
  fontSize: "12px",
  letterSpacing: "0.16em",
  margin: "0 0 48px",
  textTransform: "uppercase" as const,
};

const labelStyle = {
  color: colors.muted,
  fontSize: "11px",
  letterSpacing: "0.18em",
  margin: "0 0 8px",
};

const valueStyle = {
  color: colors.paper,
  fontSize: "16px",
  lineHeight: "1.6",
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};

const buttonStyle = {
  backgroundColor: colors.paper,
  color: colors.bg,
  display: "inline-block",
  fontSize: "12px",
  letterSpacing: "0.18em",
  marginTop: "8px",
  padding: "16px 28px",
  textDecoration: "none",
};

const hrStyle = {
  borderColor: colors.line,
  borderTop: `1px solid ${colors.line}`,
  margin: "0",
};

const footerStyle = {
  color: colors.paper,
  fontSize: "11px",
  letterSpacing: "0.22em",
  margin: "16px 0 4px",
};

const footerMutedStyle = {
  color: colors.muted,
  fontSize: "11px",
  letterSpacing: "0.08em",
  margin: 0,
};
