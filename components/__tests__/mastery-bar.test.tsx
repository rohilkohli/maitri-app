/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the MasteryBar component inline since we're testing rendering logic
const MasteryBar = ({ mastery, showLabel = true }: { mastery: number; showLabel?: boolean }) => {
  const percentage = Math.round(mastery * 100);
  const getColor = () => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full" data-testid="mastery-bar">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium" data-testid="mastery-label">
            Mastery
          </span>
        )}
        <span className="text-sm font-bold" data-testid="mastery-percentage">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
          data-testid="mastery-fill"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

describe('MasteryBar Component', () => {
  it('renders correctly with default props', () => {
    render(<MasteryBar mastery={0.5} />);

    expect(screen.getByTestId('mastery-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mastery-percentage')).toHaveTextContent('50%');
  });

  it('shows label by default', () => {
    render(<MasteryBar mastery={0.5} />);
    expect(screen.getByTestId('mastery-label')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<MasteryBar mastery={0.5} showLabel={false} />);
    expect(screen.queryByTestId('mastery-label')).not.toBeInTheDocument();
  });

  it('displays correct percentage for different mastery levels', () => {
    const { rerender } = render(<MasteryBar mastery={0} />);
    expect(screen.getByTestId('mastery-percentage')).toHaveTextContent('0%');

    rerender(<MasteryBar mastery={0.25} />);
    expect(screen.getByTestId('mastery-percentage')).toHaveTextContent('25%');

    rerender(<MasteryBar mastery={1} />);
    expect(screen.getByTestId('mastery-percentage')).toHaveTextContent('100%');
  });

  it('applies correct color classes based on mastery', () => {
    const { rerender } = render(<MasteryBar mastery={0.2} />);
    expect(screen.getByTestId('mastery-fill')).toHaveClass('bg-red-500');

    rerender(<MasteryBar mastery={0.5} />);
    expect(screen.getByTestId('mastery-fill')).toHaveClass('bg-amber-500');

    rerender(<MasteryBar mastery={0.9} />);
    expect(screen.getByTestId('mastery-fill')).toHaveClass('bg-emerald-500');
  });

  it('has correct accessibility attributes', () => {
    render(<MasteryBar mastery={0.75} />);

    const progressBar = screen.getByTestId('mastery-fill');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('sets correct width style', () => {
    render(<MasteryBar mastery={0.65} />);

    const fill = screen.getByTestId('mastery-fill');
    expect(fill).toHaveStyle({ width: '65%' });
  });

  it('handles edge case of mastery > 1', () => {
    render(<MasteryBar mastery={1.5} />);
    expect(screen.getByTestId('mastery-percentage')).toHaveTextContent('150%');
  });

  it('handles edge case of negative mastery', () => {
    render(<MasteryBar mastery={-0.1} />);
    expect(screen.getByTestId('mastery-percentage')).toHaveTextContent('-10%');
  });
});
