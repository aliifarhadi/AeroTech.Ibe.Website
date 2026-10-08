import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, IconButton } from './button';
import { Checkbox, FieldButton, SegmentedControl, Stepper, Switch, TextField } from './fields';
import { Icon } from './icon';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Calendar } from './calendar';
import { toBcp47, UiProvider } from './provider';

describe('Button', () => {
  it('calls onPress with mouse and keyboard', async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Search flights</Button>);
    const button = screen.getByRole('button', { name: 'Search flights' });
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('does not press when disabled and hides its label while pending', async () => {
    const onPress = vi.fn();
    const { rerender } = render(
      <Button isDisabled onPress={onPress}>
        Search flights
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
    rerender(
      <Button isPending onPress={onPress}>
        Search flights
      </Button>,
    );
    expect(screen.queryByText('Search flights')).not.toBeInTheDocument();
  });

  it('icon buttons are named by aria-label', () => {
    render(
      <IconButton aria-label="Close">
        <Icon name="close" />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});

describe('Stepper', () => {
  function Harness() {
    const [value, setValue] = useState(1);
    return (
      <Stepper
        label="Adults"
        value={value}
        onChange={setValue}
        min={1}
        max={2}
        decrementLabel="Fewer adults"
        incrementLabel="More adults"
      />
    );
  }

  it('stays inside its bounds', async () => {
    render(<Harness />);
    const fewer = screen.getByRole('button', { name: 'Fewer adults' });
    const more = screen.getByRole('button', { name: 'More adults' });
    expect(fewer).toBeDisabled();
    await userEvent.click(more);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    expect(more).toBeDisabled();
    await userEvent.click(fewer);
    expect(screen.getByRole('status')).toHaveTextContent('1');
  });
});

describe('SegmentedControl', () => {
  function Harness({ onChange }: { onChange: (v: string) => void }) {
    const [value, setValue] = useState<'round' | 'one'>('round');
    return (
      <SegmentedControl
        aria-label="Trip type"
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
        options={[
          { id: 'round', label: 'Round trip' },
          { id: 'one', label: 'One way' },
        ]}
      />
    );
  }

  it('selects one option and never zero', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const round = screen.getByRole('radio', { name: 'Round trip' });
    const one = screen.getByRole('radio', { name: 'One way' });
    expect(round).toBeChecked();
    await userEvent.click(one);
    expect(one).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('one');
    await userEvent.click(one);
    expect(one).toBeChecked();
  });
});

describe('fields', () => {
  it('FieldButton shows the placeholder until it has a value', () => {
    const { rerender } = render(<FieldButton label="To" placeholder="Where to?" />);
    expect(screen.getByRole('button')).toHaveTextContent('Where to?');
    rerender(<FieldButton label="To" value="Shiraz" placeholder="Where to?" />);
    expect(screen.getByRole('button')).toHaveTextContent('Shiraz');
    expect(screen.getByRole('button')).not.toHaveTextContent('Where to?');
  });

  it('TextField links its label and shows the error when invalid', () => {
    render(<TextField label="Email" isInvalid errorMessage="That email is not valid." />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInvalid();
    expect(screen.getByText('That email is not valid.')).toBeInTheDocument();
  });

  it('Switch and Checkbox toggle', async () => {
    render(
      <>
        <Switch>SMS</Switch>
        <Checkbox>I accept the terms</Checkbox>
      </>,
    );
    const sw = screen.getByRole('switch', { name: 'SMS' });
    const cb = screen.getByRole('checkbox', { name: 'I accept the terms' });
    await userEvent.click(sw);
    await userEvent.click(cb);
    expect(sw).toBeChecked();
    expect(cb).toBeChecked();
  });
});

describe('toBcp47', () => {
  it('upper-cases the region', () => {
    expect(toBcp47('fa-ir')).toBe('fa-IR');
    expect(toBcp47('en-de')).toBe('en-DE');
    expect(toBcp47('fa')).toBe('fa');
  });
});

describe('Calendar', () => {
  const renderIn = (locale: string) =>
    render(
      <UiProvider locale={locale}>
        <Calendar
          aria-label="Date"
          minValue={today(getLocalTimeZone())}
          previousLabel="Previous"
          nextLabel="Next"
        />
      </UiProvider>,
    );

  it('stays Persian in fa-ir when a Gregorian minimum is today', () => {
    renderIn('fa-ir');
    const gregorianYear = new Date().getFullYear().toLocaleString('fa-IR', { useGrouping: false });
    expect(screen.getByRole('application').textContent).not.toContain(gregorianYear);
  });

  it('is Gregorian in en-de', () => {
    renderIn('en-de');
    expect(screen.getByRole('application').textContent).toContain(String(new Date().getFullYear()));
  });
});
