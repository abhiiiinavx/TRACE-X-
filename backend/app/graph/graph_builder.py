from typing import List, Dict, Any
from backend.app.db.schemas import GraphNode, GraphEdge, EntityGraphResponse

class GraphBuilder:
    """
    Constructs an interactive entity-relationship attack graph
    linking emails, senders, domains, URLs, IPs, ASNs, geolocations, and campaigns.
    """

    @classmethod
    def build_case_graph(
        cls,
        email_data: Dict[str, Any],
        urls_data: List[Dict[str, Any]],
        hops_data: List[Dict[str, Any]],
        domains_data: List[Dict[str, Any]],
        ips_data: List[Dict[str, Any]],
        attachments_data: List[Dict[str, Any]],
        campaign_info: Dict[str, Any] = None
    ) -> EntityGraphResponse:
        nodes: Dict[str, GraphNode] = {}
        edges: List[GraphEdge] = []

        email_id = str(email_data.get("id", "email_root"))
        sender_email = email_data.get("from_addr", "unknown@sender")
        from_domain = sender_email.split("@")[-1] if "@" in sender_email else sender_email

        # 1. Email Node
        nodes[f"email:{email_id}"] = GraphNode(
            id=f"email:{email_id}",
            label=f"Email: {email_data.get('subject', 'Threat Investigation')[:24]}...",
            type="email",
            data={
                "subject": email_data.get("subject"),
                "from_addr": sender_email,
                "risk_score": email_data.get("risk_score", 75),
                "severity": email_data.get("severity", "HIGH"),
                "classification": email_data.get("classification", "Phishing"),
                "sha256": email_data.get("sha256", "")
            }
        )

        # 2. Sender Node
        nodes[f"sender:{sender_email}"] = GraphNode(
            id=f"sender:{sender_email}",
            label=f"Sender: {sender_email}",
            type="sender",
            data={
                "email": sender_email,
                "display_name": email_data.get("from_display_name", "")
            }
        )
        edges.append(GraphEdge(
            id=f"e:email-sender",
            source=f"email:{email_id}",
            target=f"sender:{sender_email}",
            label="SENT_BY",
            weight=1.0
        ))

        # 3. Domain Nodes
        for d in domains_data:
            dom_name = d.get("domain", from_domain)
            nodes[f"domain:{dom_name}"] = GraphNode(
                id=f"domain:{dom_name}",
                label=f"Domain: {dom_name}",
                type="domain",
                data={
                    "domain": dom_name,
                    "registrar": d.get("registrar"),
                    "age_days": d.get("age_days", 30),
                    "is_lookalike": d.get("is_lookalike", False),
                    "impersonated_brand": d.get("impersonated_brand"),
                    "reputation_score": d.get("reputation_score", 50),
                    "risk_score": d.get("risk_score", 50)
                }
            )

        # Connect Sender to From Domain
        if f"domain:{from_domain}" in nodes:
            edges.append(GraphEdge(
                id=f"e:sender-domain",
                source=f"sender:{sender_email}",
                target=f"domain:{from_domain}",
                label="ORIGINATES_FROM",
                weight=1.0
            ))

        # 4. IP Nodes & ASN / Geo Nodes
        for ip_item in ips_data:
            ip_str = ip_item.get("ip")
            if not ip_str or ip_str == "127.0.0.1":
                continue

            nodes[f"ip:{ip_str}"] = GraphNode(
                id=f"ip:{ip_str}",
                label=f"IP: {ip_str}",
                type="ip",
                data={
                    "ip": ip_str,
                    "country": ip_item.get("country"),
                    "city": ip_item.get("city"),
                    "asn": ip_item.get("asn"),
                    "asn_org": ip_item.get("asn_org"),
                    "is_vpn_proxy_tor": ip_item.get("is_vpn_proxy_tor", False),
                    "node_type": ip_item.get("node_type", "Public Host"),
                    "attribution_confidence": ip_item.get("attribution_confidence", 75),
                    "risk_score": ip_item.get("risk_score", 50)
                }
            )

            # ASN Node
            asn_val = ip_item.get("asn")
            if asn_val and asn_val != "AS0":
                nodes[f"asn:{asn_val}"] = GraphNode(
                    id=f"asn:{asn_val}",
                    label=f"ASN: {asn_val} ({ip_item.get('asn_org', '')[:18]})",
                    type="asn",
                    data={
                        "asn": asn_val,
                        "org": ip_item.get("asn_org")
                    }
                )
                edges.append(GraphEdge(
                    id=f"e:ip-asn:{ip_str}-{asn_val}",
                    source=f"ip:{ip_str}",
                    target=f"asn:{asn_val}",
                    label="HOSTED_ON_ASN",
                    weight=1.0
                ))

            # Geo Node
            country = ip_item.get("country")
            city = ip_item.get("city")
            if country:
                geo_id = f"geo:{country}_{city}"
                nodes[geo_id] = GraphNode(
                    id=geo_id,
                    label=f"Location: {city}, {country}",
                    type="location",
                    data={
                        "country": country,
                        "city": city,
                        "lat": ip_item.get("lat"),
                        "lng": ip_item.get("lng"),
                        "attribution_note": "Probable infrastructure origin"
                    }
                )
                edges.append(GraphEdge(
                    id=f"e:ip-geo:{ip_str}-{geo_id}",
                    source=f"ip:{ip_str}",
                    target=geo_id,
                    label="GEOLOCATED_IN",
                    weight=0.8
                ))

        # Connect Domains to IPs
        for d in domains_data:
            dom_name = d.get("domain")
            for a_rec in d.get("a_records", []):
                if f"ip:{a_rec}" in nodes:
                    edges.append(GraphEdge(
                        id=f"e:dom-ip:{dom_name}-{a_rec}",
                        source=f"domain:{dom_name}",
                        target=f"ip:{a_rec}",
                        label="RESOLVES_TO_IP",
                        weight=1.0
                    ))

        # Connect Hops to Email
        for h in hops_data:
            hop_ip = h.get("ip")
            if hop_ip and f"ip:{hop_ip}" in nodes:
                edges.append(GraphEdge(
                    id=f"e:email-hop:{email_id}-{hop_ip}-{h.get('hop_index')}",
                    source=f"email:{email_id}",
                    target=f"ip:{hop_ip}",
                    label=f"RELAY_HOP_{h.get('hop_index')}",
                    weight=0.9
                ))

        # 5. URL Nodes
        for idx, u in enumerate(urls_data):
            orig_url = u.get("original_url")
            u_domain = u.get("domain")
            u_node_id = f"url:{idx}_{u_domain}"
            nodes[u_node_id] = GraphNode(
                id=u_node_id,
                label=f"URL: {orig_url[:28]}...",
                type="url",
                data={
                    "original_url": orig_url,
                    "final_url": u.get("final_url"),
                    "domain": u_domain,
                    "is_https": u.get("is_https", False),
                    "is_credential_harvester": u.get("is_credential_harvester", False),
                    "risk_score": u.get("risk_score", 50)
                }
            )
            edges.append(GraphEdge(
                id=f"e:email-url:{email_id}-{u_node_id}",
                source=f"email:{email_id}",
                target=u_node_id,
                label="CONTAINS_URL",
                weight=1.0
            ))
            if u_domain and f"domain:{u_domain}" in nodes:
                edges.append(GraphEdge(
                    id=f"e:url-domain:{u_node_id}-{u_domain}",
                    source=u_node_id,
                    target=f"domain:{u_domain}",
                    label="RESOLVES_TO_DOMAIN",
                    weight=1.0
                ))

        # 6. Attachment Nodes
        for idx, att in enumerate(attachments_data):
            att_id = f"att:{att.get('sha256', idx)[:12]}"
            nodes[att_id] = GraphNode(
                id=att_id,
                label=f"Attachment: {att.get('filename')}",
                type="attachment",
                data={
                    "filename": att.get("filename"),
                    "mime_type": att.get("mime_type"),
                    "size_bytes": att.get("size_bytes"),
                    "sha256": att.get("sha256"),
                    "is_malicious": att.get("is_malicious", False)
                }
            )
            edges.append(GraphEdge(
                id=f"e:email-att:{email_id}-{att_id}",
                source=f"email:{email_id}",
                target=att_id,
                label="INCLUDES_ATTACHMENT",
                weight=1.0
            ))

        # 7. Campaign Node
        if campaign_info and campaign_info.get("matched"):
            camp_name = campaign_info.get("campaign_name", "Active Threat Campaign")
            camp_id = f"camp:{camp_name[:20]}"
            nodes[camp_id] = GraphNode(
                id=camp_id,
                label=f"Campaign: {camp_name[:32]}",
                type="campaign",
                data={
                    "name": camp_name,
                    "confidence": campaign_info.get("confidence", 90),
                    "primary_threat_type": campaign_info.get("primary_threat_type"),
                    "shared_signals": campaign_info.get("shared_signals", [])
                }
            )
            edges.append(GraphEdge(
                id=f"e:email-camp:{email_id}-{camp_id}",
                source=f"email:{email_id}",
                target=camp_id,
                label="BELONGS_TO_CAMPAIGN",
                weight=1.2
            ))

        return EntityGraphResponse(
            nodes=list(nodes.values()),
            edges=edges
        )
