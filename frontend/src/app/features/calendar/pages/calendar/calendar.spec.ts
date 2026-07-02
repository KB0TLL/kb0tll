import { render } from '@testing-library/angular';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders the current month and a calendar grid', async () => {
    const { getByText } = await render(Calendar);

    expect(getByText(/Calendar Club/i)).toBeTruthy();
  });
});
