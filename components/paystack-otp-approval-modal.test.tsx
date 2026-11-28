import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PaystackOtpApprovalModal } from './paystack-otp-approval-modal';
import { AdminProvider } from './admin-context';
import { apiFetch } from '@/lib/client-api';

jest.mock('@/lib/client-api', () => ({
  apiFetch: jest.fn(),
  ClientApiError: class ClientApiError extends Error {},
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

function renderModal(twoFactorEnabled = true) {
  const admin = {
    id: 'admin-1',
    adminId: 'admin-1',
    name: 'Finance Operator',
    email: 'finance@example.test',
    role: 'FINANCE_OFFICER' as const,
    twoFactorEnabled,
  };
  const onClose = jest.fn();
  const onComplete = jest.fn();
  render(
    <AdminProvider admin={admin}>
      <PaystackOtpApprovalModal
        reference="zp-test-reference"
        onClose={onClose}
        onComplete={onComplete}
      />
    </AdminProvider>,
  );
  return { onClose, onComplete };
}

describe('PaystackOtpApprovalModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends business OTP and fresh step-up TOTP only to the protected backend endpoint', async () => {
    mockApiFetch.mockResolvedValue({ success: true, status: 'completed' } as any);
    const { onComplete } = renderModal(true);

    fireEvent.change(screen.getByLabelText('Paystack business approval code'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText('Fresh authenticator code / recovery code'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit approval' }));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/admin/paystack/transfers/zp-test-reference/finalize',
      {
        method: 'POST',
        body: JSON.stringify({ otp: '123456', stepUpCode: '654321' }),
      },
    );
    expect(onComplete).toHaveBeenCalledWith({ success: true, status: 'completed' });
  });

  it('clears both codes after a failed or uncertain approval request', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network response was lost'));
    renderModal(true);

    const otpInput = screen.getByLabelText('Paystack business approval code') as HTMLInputElement;
    const stepUpInput = screen.getByLabelText('Fresh authenticator code / recovery code') as HTMLInputElement;
    fireEvent.change(otpInput, { target: { value: '123456' } });
    fireEvent.change(stepUpInput, { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit approval' }));

    await waitFor(() => {
      expect(otpInput.value).toBe('');
      expect(stepUpInput.value).toBe('');
    });
    expect(await screen.findByText('Approval could not be confirmed. Check the transfer status before trying again.')).toBeInTheDocument();
  });

  it('blocks approval when the admin has not enabled mandatory 2FA', async () => {
    renderModal(false);

    fireEvent.change(screen.getByLabelText('Paystack business approval code'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText('Fresh authenticator code / recovery code'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit approval' }));

    expect(await screen.findByText('Enable admin two-factor authentication before approving Paystack payouts.')).toBeInTheDocument();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('rejects malformed business OTP locally without making a network request', async () => {
    renderModal(true);
    fireEvent.change(screen.getByLabelText('Paystack business approval code'), {
      target: { value: '12ab' },
    });
    fireEvent.change(screen.getByLabelText('Fresh authenticator code / recovery code'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit approval' }));

    expect(await screen.findByText('Enter the 4–8 digit Paystack business approval code.')).toBeInTheDocument();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });
});
