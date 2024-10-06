import { useState } from 'react';

const MoodSelector = ({ getRecommendations }) => {
  const [mood, setMood] = useState('happy');

  const handleChange = (event) => {
    setMood(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    getRecommendations(mood);
  };

  return (
    <div>
      <h2>Select Your Mood</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Mood:
          <select value={mood} onChange={handleChange}>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="energetic">Energetic</option>
            <option value="calm">Calm</option>
          </select>
        </label>
        <button type="submit">Get Song Recommendations</button>
      </form>
    </div>
  );
};

export default MoodSelector;
