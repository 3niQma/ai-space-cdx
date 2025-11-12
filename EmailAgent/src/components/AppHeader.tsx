import MailIcon from '@mui/icons-material/MailOutline';
import { Avatar, Box, Divider, Stack, Typography } from '@mui/material';

export const AppHeader = () => {
  return (
    <Box mb={4}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <MailIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1">
            Noah&apos;s Email Agent
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate polished replies for Noah Klarmann with GDPR-safe anonymization.
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ mt: 3 }} />
    </Box>
  );
};
