import {
  Box, Chip, Container, Typography
} from "@mui/material";

type HeadingModalProps = {
  optSubheadings: string[];
  addSubheading: (subheading: string) => void;
}

export const HeadingModal = ({
  optSubheadings,
  addSubheading,
}: HeadingModalProps) => {
  return (
    <Container maxWidth="sm" className="p-heading-modal">
      <h2>小見出しの追加(作成中)</h2>
      <Typography variant="caption">
        必要に応じて小見出しを追加します。
        提案を使用するまたは手動で入力し小見出しのタイトルを決定してください。
      </Typography>
      <Box>
        {optSubheadings.length > 0 && optSubheadings.map((v, i) =>
          <Chip key={i} label={v} onClick={() => addSubheading(v)} />)}
      </Box>
    </Container>
  );
};