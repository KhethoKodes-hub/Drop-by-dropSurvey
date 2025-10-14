// components/SurveyForm.jsx
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState } from 'react';

export default function SurveyForm({ township }) {
  const { register, handleSubmit, reset } = useForm();
  const [status, setStatus] = useState(null);

  const onSubmit = async (data) => {
    try {
      setStatus('sending');
      data.township = township;
      const res = await axios.post('/api/submit', data);
      setStatus('success');
      reset();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="card p-3">
      <h4 className="mb-3">Survey — {township}</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section A */}
        <h6>Section A: Household Information</h6>

        <label className="form-label mt-2">How many people live in your household?</label>
        <div className="mb-2">
          <div className="form-check">
            <input {...register('householdSize')} className="form-check-input" type="radio" value="1" id="hs1" />
            <label className="form-check-label" htmlFor="hs1">1</label>
          </div>
          <div className="form-check">
            <input {...register('householdSize')} className="form-check-input" type="radio" value="2–3" id="hs2" />
            <label className="form-check-label" htmlFor="hs2">2–3</label>
          </div>
          <div className="form-check">
            <input {...register('householdSize')} className="form-check-input" type="radio" value="4–5" id="hs3" />
            <label className="form-check-label" htmlFor="hs3">4–5</label>
          </div>
          <div className="form-check">
            <input {...register('householdSize')} className="form-check-input" type="radio" value="6 or more" id="hs4" />
            <label className="form-check-label" htmlFor="hs4">6 or more</label>
          </div>
        </div>

        <label className="form-label">Type of dwelling:</label>
        <select {...register('dwellingType')} className="form-select mb-2">
          <option value="">Select</option>
          <option>RDP house</option>
          <option>Informal settlement/shack</option>
          <option>Brick house</option>
          <option>Apartment/Flat</option>
          <option>Other</option>
        </select>
        <input {...register('dwellingTypeOther')} className="form-control mb-2" placeholder="If Other, please specify" />

        <label className="form-label">Do you own or rent this property?</label>
        <select {...register('ownOrRent')} className="form-select mb-2">
          <option value="">Select</option>
          <option>Own</option>
          <option>Rent</option>
          <option>Other</option>
        </select>
        <input {...register('ownOrRentOther')} className="form-control mb-2" placeholder="If Other, please specify" />

        <label className="form-label">Does your home have a water meter?</label>
        <select {...register('hasMeter')} className="form-select mb-3">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
          <option>Not sure</option>
        </select>

        {/* Section B */}
        <h6>Section B: Water Usage Practices</h6>

        <label className="form-label mt-2">What are your main sources of water? (Select all that apply)</label>
        <div className="mb-2">
          <div className="form-check">
            <input {...register('waterSources')} className="form-check-input" type="checkbox" value="Municipal tap (in-house)" id="ws1" />
            <label className="form-check-label" htmlFor="ws1">Municipal tap (in-house)</label>
          </div>
          <div className="form-check">
            <input {...register('waterSources')} className="form-check-input" type="checkbox" value="Municipal tap (yard)" id="ws2" />
            <label className="form-check-label" htmlFor="ws2">Municipal tap (yard)</label>
          </div>
          <div className="form-check">
            <input {...register('waterSources')} className="form-check-input" type="checkbox" value="Communal tap" id="ws3" />
            <label className="form-check-label" htmlFor="ws3">Communal tap</label>
          </div>
          <div className="form-check">
            <input {...register('waterSources')} className="form-check-input" type="checkbox" value="Borehole" id="ws4" />
            <label className="form-check-label" htmlFor="ws4">Borehole</label>
          </div>
          <div className="form-check">
            <input {...register('waterSources')} className="form-check-input" type="checkbox" value="Rainwater tank" id="ws5" />
            <label className="form-check-label" htmlFor="ws5">Rainwater tank</label>
          </div>
          <input {...register('waterSourcesOther')} className="form-control mt-2" placeholder="Other water source (if any)" />
        </div>

        <label className="form-label">How often do you experience water shortages or low pressure?</label>
        <select {...register('shortagesFreq')} className="form-select mb-2">
          <option value="">Select</option>
          <option>Frequently (several times a week)</option>
          <option>Occasionally (few times a month)</option>
          <option>Rarely</option>
          <option>Never</option>
        </select>

        <label className="form-label">Which of the following are used in your home? (Select all that apply)</label>
        <div className="mb-2">
          <div className="form-check">
            <input {...register('homeDevices')} className="form-check-input" type="checkbox" value="Dual-flush toilet" id="hd1" />
            <label className="form-check-label" htmlFor="hd1">Dual-flush toilet</label>
          </div>
          <div className="form-check">
            <input {...register('homeDevices')} className="form-check-input" type="checkbox" value="Low-flow showerhead" id="hd2" />
            <label className="form-check-label" htmlFor="hd2">Low-flow showerhead</label>
          </div>
          <div className="form-check">
            <input {...register('homeDevices')} className="form-check-input" type="checkbox" value="Rainwater collection system" id="hd3" />
            <label className="form-check-label" htmlFor="hd3">Rainwater collection system</label>
          </div>
          <div className="form-check">
            <input {...register('homeDevices')} className="form-check-input" type="checkbox" value="Greywater reuse system" id="hd4" />
            <label className="form-check-label" htmlFor="hd4">Greywater reuse system</label>
          </div>
          <div className="form-check">
            <input {...register('homeDevices')} className="form-check-input" type="checkbox" value="None of the above" id="hd5" />
            <label className="form-check-label" htmlFor="hd5">None of the above</label>
          </div>
        </div>

        <label className="form-label">How do you usually water your garden/yard (if applicable)?</label>
        <select {...register('gardenWatering')} className="form-select mb-3">
          <option value="">Select</option>
          <option>Hosepipe</option>
          <option>Bucket</option>
          <option>Sprinkler</option>
          <option>I don’t water the garden</option>
          <option>Not applicable</option>
        </select>

        {/* Section C */}
        <h6>Section C: Awareness & Attitudes</h6>
        <label className="form-label">Have you ever received any education or information about water conservation?</label>
        <select {...register('receivedEducation')} className="form-select mb-2">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
          <option>Not sure</option>
        </select>

        <label className="form-label">How concerned are you about water scarcity in your community?</label>
        <select {...register('concernLevel')} className="form-select mb-2">
          <option value="">Select</option>
          <option>Very concerned</option>
          <option>Somewhat concerned</option>
          <option>Neutral</option>
          <option>Not concerned</option>
        </select>

        <label className="form-label">Do you know how to report a water leak in your area?</label>
        <select {...register('knowHowToReport')} className="form-select mb-2">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>

        <label className="form-label">Have you ever reported a water-related issue (leak, spillage, sewer blockage)?</label>
        <select {...register('reportedIssue')} className="form-select mb-3">
          <option value="">Select</option>
          <option>Yes – and it was resolved</option>
          <option>Yes – but it was not resolved</option>
          <option>No – I didn’t know how</option>
          <option>No – I didn’t think it was necessary</option>
        </select>

        {/* Section D */}
        <h6>Section D: Infrastructure & Challenges</h6>
        <label className="form-label">Have you noticed any of the following in your area? (Tick all that apply)</label>
        <div className="mb-2">
          <div className="form-check">
            <input {...register('areaNotices')} className="form-check-input" type="checkbox" value="Unreported water leaks" id="an1" />
            <label className="form-check-label" htmlFor="an1">Unreported water leaks</label>
          </div>
          <div className="form-check">
            <input {...register('areaNotices')} className="form-check-input" type="checkbox" value="Sewer overflows or blockages" id="an2" />
            <label className="form-check-label" htmlFor="an2">Sewer overflows or blockages</label>
          </div>
          <div className="form-check">
            <input {...register('areaNotices')} className="form-check-input" type="checkbox" value="Illegal water connections" id="an3" />
            <label className="form-check-label" htmlFor="an3">Illegal water connections</label>
          </div>
          <div className="form-check">
            <input {...register('areaNotices')} className="form-check-input" type="checkbox" value="Litter or waste in water drains" id="an4" />
            <label className="form-check-label" htmlFor="an4">Litter or waste in water drains</label>
          </div>
          <div className="form-check">
            <input {...register('areaNotices')} className="form-check-input" type="checkbox" value="None of the above" id="an5" />
            <label className="form-check-label" htmlFor="an5">None of the above</label>
          </div>
        </div>

        <label className="form-label">How would you rate the condition of water infrastructure in your area?</label>
        <select {...register('infrastructureRating')} className="form-select mb-3">
          <option value="">Select</option>
          <option>Excellent</option>
          <option>Good</option>
          <option>Fair</option>
          <option>Poor</option>
          <option>Very poor</option>
        </select>

        {/* Section E */}
        <h6>Section E: Willingness to Engage</h6>
        <label className="form-label">Would you be interested in attending a community workshop on water conservation?</label>
        <select {...register('interestWorkshop')} className="form-select mb-2">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
          <option>Maybe</option>
        </select>

        <label className="form-label">Would you be willing to adopt water-saving practices if trained and supported?</label>
        <select {...register('willingAdopt')} className="form-select mb-2">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
          <option>Maybe</option>
        </select>

        <label className="form-label">Do you think schools, churches, and local businesses should play a role in promoting water conservation?</label>
        <select {...register('communityRole')} className="form-select mb-3">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
          <option>Not sure</option>
        </select>

        <label className="form-label">What do you think is the biggest water-related challenge in your community?</label>
        <textarea {...register('biggestChallenge')} className="form-control mb-2" rows="2" />

        <label className="form-label">What suggestions do you have for improving water conservation in your area?</label>
        <textarea {...register('suggestions')} className="form-control mb-3" rows="2" />

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">All answers are confidential.</small>
          <div>
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Submit'}
            </button>
          </div>
        </div>

        {status === 'success' && <div className="alert alert-success mt-3">Response saved. Thank you!</div>}
        {status === 'error' && <div className="alert alert-danger mt-3">Error saving response. Try again.</div>}
      </form>
    </div>
  );
}
