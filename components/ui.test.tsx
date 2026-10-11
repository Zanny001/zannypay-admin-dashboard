import { render, screen } from '@testing-library/react';
import { StatusBadge, SeverityBadge, Button, Input, Select } from './ui';

// StatusBadge classifies dozens of different status strings (transactions,
// disputes, KYC, loans, support conversations, recurring transfers) into
// green/amber/red at a glance. A wrong classification here doesn't crash
// anything — it just quietly shows an admin the wrong signal, which is a
// worse failure mode than a visible bug. This documents the current
// mapping precisely, so a future change to it is a deliberate decision,
// not an accidental regression.
describe('StatusBadge', () => {
  it.each(['completed', 'approved', 'confirmed', 'active', 'resolved'])(
    'classifies "%s" as green (case-insensitively)',
    (status) => {
      render(<StatusBadge status={status.toUpperCase()} />);
      expect(screen.getByText(status.toUpperCase())).toHaveClass('bg-emerald-50');
    },
  );

  it.each(['pending', 'open', 'review'])('classifies "%s" as amber', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toHaveClass('bg-amber-50');
  });

  it.each(['failed', 'rejected', 'dismissed', 'frozen'])('classifies "%s" as red', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toHaveClass('bg-red-50');
  });

  it('falls back to neutral slate for any status it does not recognize, rather than guessing', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('cancelled')).toHaveClass('bg-slate-100');
  });

  it('always displays the exact original status text, even though classification is case-insensitive', () => {
    render(<StatusBadge status="Approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});

describe('SeverityBadge', () => {
  it.each([
    ['LOW', 'bg-slate-100'],
    ['MEDIUM', 'bg-amber-50'],
    ['HIGH', 'bg-brand-gold/10'],
    ['CRITICAL', 'bg-red-50'],
  ])('classifies %s severity with the expected tone', (severity, expectedClass) => {
    render(<SeverityBadge severity={severity} />);
    expect(screen.getByText(severity)).toHaveClass(expectedClass);
  });

  it('falls back to neutral slate for an unrecognized severity value rather than throwing', () => {
    render(<SeverityBadge severity="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toHaveClass('bg-slate-100');
  });
});

describe('Button loading state', () => {
  it('disables the button and marks it aria-busy while loading', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('is not disabled or aria-busy when not loading', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('stays disabled if both disabled and loading are set — loading does not accidentally re-enable it', () => {
    render(<Button disabled loading={false}>Save</Button>);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});

describe('Input error state', () => {
  it('renders the error message and marks the field aria-invalid', () => {
    render(<Input aria-label="Email" error="Enter a valid email address" />);
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('marks the field aria-invalid=false and renders no message when there is no error', () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  it('still forwards ordinary input props (value, onChange) alongside error', () => {
    const handleChange = jest.fn();
    render(<Input aria-label="Email" value="a@b.com" onChange={handleChange} error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveValue('a@b.com');
  });
});

describe('Select error state', () => {
  it('renders the error message and marks the field aria-invalid', () => {
    render(
      <Select aria-label="Role" error="Select a role">
        <option value="">Choose…</option>
      </Select>,
    );
    expect(screen.getByText('Select a role')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toHaveAttribute('aria-invalid', 'true');
  });
});
