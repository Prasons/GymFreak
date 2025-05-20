-- Fix table names in workoutPlanController
UPDATE pg_proc SET prosrc = regexp_replace(prosrc, 'user_workoutplans', 'user_workout_plans', 'g')
WHERE proname IN ('setuserworkoutplan', 'unsetuserworkoutplan');

-- Verify the changes
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('setuserworkoutplan', 'unsetuserworkoutplan');
