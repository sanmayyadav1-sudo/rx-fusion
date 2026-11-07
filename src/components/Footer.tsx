"use client";

import React from "react";
import Link from "next/link";
import { YR, SL } from "@/lib/rxfusionData";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <Link className="logo" href="/" style={{ color: "#fff" }}>
              RxFusion
            </Link>
            <p style={{ marginTop: "10px", lineHeight: "1.5" }}>
              Pharmacy Knowledge. Clinical Excellence.
              <br />
              Built exclusively for Pharm.D students.
            </p>
          </div>

          <div>
            <h4>Academic Hub</h4>
            <ul>
              {YR.map((y, i) => (
                <li key={y}>
                  <Link href={`/academic-hub/${SL[i]}`}>{y} year</Link>
                </li>
              ))}
              <li>
                <Link href="/academic-hub">Notes and question banks</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Clinical Hub</h4>
            <ul>
              <li>
                <Link href="/clinical-cases">Clinical cases</Link>
              </li>
              <li>
                <Link href="/drug-database">Drug database</Link>
              </li>
              <li>
                <Link href="/clinical-hub">Specialties</Link>
              </li>
              <li>
                <Link href="/learning-tools">Learning tools</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Research</h4>
            <ul>
              <li>
                <Link href="/research-hub">Research Hub</Link>
              </li>
              <li>
                <Link href="/resources">Publication resources</Link>
              </li>
              <li>
                <Link href="/blogs">Blogs</Link>
              </li>
              <li>
                <Link href="/news">News</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Information</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/about">Contact</Link>
              </li>
              <li>
                <Link href="/about">Privacy Policy & Guidelines</Link>
              </li>
              <li>
                <Link href="/about">Terms of Service</Link>
              </li>
              <li style={{ marginTop: "8px" }}>
                <a
                  href="https://t.me/rxfusion"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram Community
                </a>{" "}
                ·{" "}
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="bt">
          © 2026 RxFusion. Exclusively dedicated to Pharm.D education, clinical hospital training and evidence-based pharmaceutical care.
        </div>
      </div>
    </footer>
  );
}
