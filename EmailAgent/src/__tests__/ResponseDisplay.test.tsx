import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ResponseDisplay } from '../components/ResponseDisplay';

const renderComponent = (value = '') => {
  const user = userEvent.setup();
  const onCopy = vi.fn();
  render(
    <ThemeProvider theme={createTheme()}>
      <ResponseDisplay
        value={value}
        isEditing={false}
        onChange={() => undefined}
        onToggleEdit={() => undefined}
        onCopy={onCopy}
        copied={false}
        onRegenerate={() => Promise.resolve()}
        isGenerating={false}
        canDeAnonymize
        onDeAnonymize={() => undefined}
        usage={null}
      />
    </ThemeProvider>,
  );

  return { user, onCopy };
};

describe('<ResponseDisplay />', () => {
  it('disables actions before a response is present', () => {
    renderComponent('');
    expect(screen.getByRole('button', { name: /copy/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /de-anonymize response/i })).toBeDisabled();
  });

  it('invokes copy handler when text exists', async () => {
    const { user, onCopy } = renderComponent('Sample reply');
    const button = screen.getByRole('button', { name: /copy/i });
    expect(button).toBeEnabled();
    await user.click(button);
    expect(onCopy).toHaveBeenCalled();
  });
});
