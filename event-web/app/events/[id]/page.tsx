"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const EventPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();

        if (res.ok) {
          setEvent(data);
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{event.eventTitle}</h1>
      <p>
        {event.eventDateTime?.date} · {event.eventDateTime?.startTime} - {event.eventDateTime?.endTime}
      </p>
      <p>{event.location?.streetAddress}, {event.location?.city}</p>

      <h3>Scan to Share Event</h3>
      <QRCode value={`${window.location.origin}/events/${id}`} size={200} />
    </div>
  );
};

export default EventPage;
