import { forwardRef } from 'react';
import { ToggleButton, Tooltip, type ToggleButtonProps, type TooltipProps } from '@mui/material';

interface Props extends ToggleButtonProps {
  tooltip: string;
  placement?: TooltipProps['placement'];
}

/**
 * ToggleButton with a hover tooltip in the app's MUI tooltip style.
 * Spreads ToggleButtonGroup-injected props onto the inner button so it still
 * works as a group child. The tooltip is omitted while disabled — the group
 * shows its own tooltip in that state, and MUI can't hover a disabled child
 * (avoids the "disabled child to Tooltip" warning).
 */
export const TooltipToggleButton = forwardRef<HTMLButtonElement, Props>(
  ({ tooltip, placement = 'bottom', ...props }, ref) => {
    const button = <ToggleButton ref={ref} {...props} />;
    return props.disabled ? (
      button
    ) : (
      <Tooltip title={tooltip} placement={placement}>
        {button}
      </Tooltip>
    );
  },
);
TooltipToggleButton.displayName = 'TooltipToggleButton';
