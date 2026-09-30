import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
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

export default function ContactConfirmationEmail({
  inquiry,
}: {
  inquiry: ContactInquiry;
}) {
  return (
    <Html>
      <Head />
      <Preview>{"We've received your project inquiry."}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={wordmarkStyle}>33 FILMS</Text>
          <Hr style={hrStyle} />
          <Text style={titleStyle}>THANK YOU FOR REACHING OUT.</Text>
          <Text style={bodyCopyStyle}>{"We've received your project inquiry."}</Text>
          <Text style={metaStyle}>{inquiry.name}</Text>
          <Text style={metaStyle}>
            {PROJECT_TYPE_LABEL[inquiry.projectType]}
          </Text>
          <Text style={bodyCopyStyle}>
            33 Films will be in touch.
          </Text>
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
  fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
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
  fontSize: "26px",
  fontWeight: 400,
  letterSpacing: "0.04em",
  lineHeight: "1.25",
  margin: "32px 0 20px",
};

const bodyCopyStyle = {
  color: colors.paper,
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const metaStyle = {
  color: colors.muted,
  fontSize: "13px",
  letterSpacing: "0.12em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
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
