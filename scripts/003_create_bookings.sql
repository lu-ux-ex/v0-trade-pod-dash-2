-- Create bookings table

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  total_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "users_view_own_bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "admins_view_all_bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can create their own bookings
CREATE POLICY "users_create_bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "users_update_own_bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all bookings
CREATE POLICY "admins_manage_bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_facility ON public.bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
